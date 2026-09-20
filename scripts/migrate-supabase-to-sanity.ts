/**
 * One-off, idempotent migration: Supabase (Postgres + Vercel Blob) -> Sanity CMS.
 *
 * Usage:
 *   npm run migrate:sanity -- --dry-run                 # read Supabase, plan only, touch nothing in Sanity
 *   npm run migrate:sanity -- --dataset staging         # real run against the `staging` dataset
 *   npm run migrate:sanity                              # real run against NEXT_PUBLIC_SANITY_DATASET
 *
 * Env (loaded via `tsx --env-file=.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN (required unless --dry-run)
 *
 * Mapping (8 Postgres tables -> 3 Sanity document types):
 *   project + project_image + project_image_link           -> project
 *     (skill / project_skill_link are ignored; project.skills[] is the source of truth)
 *   gallery_photo                                           -> galleryPhoto
 *   gallery_collection + gallery_photo_collection_link      -> galleryCollection
 *
 * Postgres UUIDs are reused as Sanity _ids and every write is createOrReplace, so
 * reruns converge on the same state. Image assets are de-duplicated by
 * `source.id == <postgres row uuid>` so reruns never re-upload bytes.
 */

import { createClient as createSanityClient } from "@sanity/client";
import type { SanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "../src/app/types/supabase";

// ---------------------------------------------------------------------------
// CLI + env
// ---------------------------------------------------------------------------

interface CliOptions {
  dryRun: boolean;
  dataset: string | undefined;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { dryRun: false, dataset: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--dataset") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        fail("--dataset requires a value, e.g. --dataset staging");
      }
      opts.dataset = value;
      i++;
    } else if (arg.startsWith("--dataset=")) {
      opts.dataset = arg.slice("--dataset=".length);
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: migrate-supabase-to-sanity [--dry-run] [--dataset <name>]"
      );
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

function fail(message: string): never {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    fail(
      `Missing required env var ${name}. Run via \`npm run migrate:sanity\` so .env.local is loaded, or export it.`
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectRow = Tables<"project">;
type ProjectImageRow = Tables<"project_image">;
type ProjectImageLinkRow = Tables<"project_image_link">;
type GalleryPhotoRow = Tables<"gallery_photo">;
type GalleryCollectionRow = Tables<"gallery_collection">;
type GalleryPhotoCollectionLinkRow = Tables<"gallery_photo_collection_link">;

type TypedSupabase = SupabaseClient<Database>;

interface SanityReference {
  _type: "reference";
  _ref: string;
}

interface SanityImageField {
  _type: "image";
  asset: SanityReference;
}

interface ProjectImageMember extends SanityImageField {
  _key: string;
  caption?: string;
  alt?: string;
}

interface ProjectDoc {
  _id: string;
  _type: "project";
  title: string;
  description: string;
  skills: string[];
  images: ProjectImageMember[];
  projectEndDate?: string;
  projectLink?: string;
  featured: boolean;
}

interface GalleryPhotoDoc {
  _id: string;
  _type: "galleryPhoto";
  photoName?: string;
  alt?: string;
  image: SanityImageField;
}

interface GalleryCollectionDoc {
  _id: string;
  _type: "galleryCollection";
  name: string;
  slug: { _type: "slug"; current: string };
  description?: string;
  photos: (SanityReference & { _key: string })[];
  coverPhoto?: SanityReference;
}

/** An image asset we need in Sanity, keyed by the Postgres row that owns it. */
interface AssetPlan {
  /** Postgres uuid of the owning row (gallery_photo.id or project_image.id). */
  rowId: string;
  kind: "gallery_photo" | "project_image";
  blobUrl: string;
  filename: string;
}

interface SupabaseSnapshot {
  projects: ProjectRow[];
  projectImages: ProjectImageRow[];
  projectImageLinks: ProjectImageLinkRow[];
  galleryPhotos: GalleryPhotoRow[];
  galleryCollections: GalleryCollectionRow[];
  galleryPhotoCollectionLinks: GalleryPhotoCollectionLinkRow[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SANITY_API_VERSION = "2026-09-19";
const ASSET_SOURCE_NAME = "supabase-migration";
const SUPABASE_PAGE_SIZE = 1000;
const MUTATION_BATCH_SIZE = 50;
const UPLOAD_CONCURRENCY = 4;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertValidSanityId(id: string, context: string): void {
  if (!/^[a-zA-Z0-9._-]+$/.test(id)) {
    fail(`${context}: "${id}" is not a valid Sanity _id`);
  }
}

function filenameFromUrl(url: string, fallback: string): string {
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : fallback;
  } catch {
    return fallback;
  }
}

/** Normalize a Postgres date/timestamp string to YYYY-MM-DD. */
function toIsoDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return match ? match[0] : undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

/** Sort comparator: display_order ascending with nulls last, then created_at descending. */
function byDisplayOrder<
  T extends { display_order: number | null; created_at: string | null },
>(a: T, b: T): number {
  const ao = a.display_order ?? Number.POSITIVE_INFINITY;
  const bo = b.display_order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return (b.created_at ?? "").localeCompare(a.created_at ?? "");
}

function padRight(value: string | number, width: number): string {
  return String(value).padEnd(width);
}

function printTable(headers: string[], rows: (string | number)[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length))
  );
  const line = (cells: (string | number)[]) =>
    "  " + cells.map((c, i) => padRight(c, widths[i])).join("  ");
  console.log(line(headers));
  console.log("  " + widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) console.log(line(row));
}

// ---------------------------------------------------------------------------
// Supabase reads
// ---------------------------------------------------------------------------

type PublicTableName = keyof Database["public"]["Tables"];

async function fetchAll<T extends PublicTableName>(
  supabase: TypedSupabase,
  table: T
): Promise<Tables<T>[]> {
  const rows: Tables<T>[] = [];
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) {
      fail(`Supabase read of "${table}" failed: ${error.message}`);
    }
    const page = (data ?? []) as Tables<T>[];
    rows.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
  }
  return rows;
}

async function readSupabase(supabase: TypedSupabase): Promise<SupabaseSnapshot> {
  const [
    projects,
    projectImages,
    projectImageLinks,
    galleryPhotos,
    galleryCollections,
    galleryPhotoCollectionLinks,
  ] = await Promise.all([
    fetchAll(supabase, "project"),
    fetchAll(supabase, "project_image"),
    fetchAll(supabase, "project_image_link"),
    fetchAll(supabase, "gallery_photo"),
    fetchAll(supabase, "gallery_collection"),
    fetchAll(supabase, "gallery_photo_collection_link"),
  ]);
  return {
    projects,
    projectImages,
    projectImageLinks,
    galleryPhotos,
    galleryCollections,
    galleryPhotoCollectionLinks,
  };
}

// ---------------------------------------------------------------------------
// Planning (pure: Supabase rows -> intended Sanity documents)
// ---------------------------------------------------------------------------

interface MigrationPlan {
  assets: AssetPlan[];
  galleryPhotos: GalleryPhotoDoc[];
  projects: ProjectDoc[];
  galleryCollections: GalleryCollectionDoc[];
  warnings: string[];
}

/** Placeholder asset ref; resolved to a real asset _id after upload. */
const PENDING_ASSET_PREFIX = "pending-asset:";

function pendingAssetRef(rowId: string): SanityReference {
  return { _type: "reference", _ref: `${PENDING_ASSET_PREFIX}${rowId}` };
}

function buildPlan(snapshot: SupabaseSnapshot): MigrationPlan {
  const warnings: string[] = [];
  const assets: AssetPlan[] = [];

  // --- galleryPhoto ------------------------------------------------------
  const galleryPhotoDocs: GalleryPhotoDoc[] = snapshot.galleryPhotos.map((row) => {
    assertValidSanityId(row.id, "gallery_photo.id");
    assets.push({
      rowId: row.id,
      kind: "gallery_photo",
      blobUrl: row.blob_url,
      filename: row.filename || filenameFromUrl(row.blob_url, `${row.id}.jpg`),
    });
    const doc: GalleryPhotoDoc = {
      _id: row.id,
      _type: "galleryPhoto",
      image: { _type: "image", asset: pendingAssetRef(row.id) },
    };
    if (row.photo_name && row.photo_name.trim()) {
      doc.photoName = row.photo_name.trim();
    }
    return doc;
  });
  const photoIds = new Set(galleryPhotoDocs.map((d) => d._id));

  // --- project -----------------------------------------------------------
  const imagesById = new Map(snapshot.projectImages.map((img) => [img.id, img]));
  const linksByProject = new Map<string, ProjectImageLinkRow[]>();
  for (const link of snapshot.projectImageLinks) {
    const list = linksByProject.get(link.project_id) ?? [];
    list.push(link);
    linksByProject.set(link.project_id, list);
  }

  const projectDocs: ProjectDoc[] = snapshot.projects.map((row) => {
    assertValidSanityId(row.id, "project.id");

    // Ordering: project.images[] is the authoritative ordered list of
    // project_image ids (project_image_link has no ordering column). Any
    // linked image missing from that array is appended in created_at order.
    const ordered: string[] = [];
    const seen = new Set<string>();
    for (const imageId of row.images ?? []) {
      if (!seen.has(imageId)) {
        seen.add(imageId);
        ordered.push(imageId);
      }
    }
    const extraLinked = (linksByProject.get(row.id) ?? [])
      .map((l) => l.image_id)
      .filter((id) => !seen.has(id))
      .map((id) => imagesById.get(id))
      .filter((img): img is ProjectImageRow => Boolean(img))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    for (const img of extraLinked) {
      warnings.push(
        `project "${row.title}" (${row.id}): image ${img.id} is linked but absent from project.images[]; appended at end`
      );
      seen.add(img.id);
      ordered.push(img.id);
    }

    const images: ProjectImageMember[] = [];
    for (const imageId of ordered) {
      const img = imagesById.get(imageId);
      if (!img) {
        warnings.push(
          `project "${row.title}" (${row.id}): references image ${imageId} which has no project_image row; skipped`
        );
        continue;
      }
      assertValidSanityId(img.id, "project_image.id");
      assets.push({
        rowId: img.id,
        kind: "project_image",
        blobUrl: img.blob_url,
        filename: filenameFromUrl(img.blob_url, `${img.id}.jpg`),
      });
      const member: ProjectImageMember = {
        _type: "image",
        _key: img.id,
        asset: pendingAssetRef(img.id),
      };
      if (img.caption && img.caption.trim()) {
        member.caption = img.caption.trim();
      }
      images.push(member);
    }

    const doc: ProjectDoc = {
      _id: row.id,
      _type: "project",
      title: row.title,
      description: row.description,
      skills: (row.skills ?? []).map((s) => s.trim()).filter(Boolean),
      images,
      featured: false,
    };
    const endDate = toIsoDate(row.project_end_date);
    if (endDate) doc.projectEndDate = endDate;
    return doc;
  });

  // --- galleryCollection -------------------------------------------------
  const linksByCollection = new Map<string, GalleryPhotoCollectionLinkRow[]>();
  for (const link of snapshot.galleryPhotoCollectionLinks) {
    const list = linksByCollection.get(link.collection_id) ?? [];
    list.push(link);
    linksByCollection.set(link.collection_id, list);
  }

  const slugsSeen = new Map<string, string>();
  const collectionDocs: GalleryCollectionDoc[] = snapshot.galleryCollections.map(
    (row) => {
      assertValidSanityId(row.id, "gallery_collection.id");
      const slug = slugify(row.name);
      if (!slug) {
        fail(`gallery_collection "${row.name}" (${row.id}) slugifies to an empty string`);
      }
      const clash = slugsSeen.get(slug);
      if (clash) {
        fail(
          `Slug collision: collections ${clash} and ${row.id} both slugify to "${slug}"`
        );
      }
      slugsSeen.set(slug, row.id);

      const photos: (SanityReference & { _key: string })[] = [];
      const seen = new Set<string>();
      for (const link of (linksByCollection.get(row.id) ?? []).sort(byDisplayOrder)) {
        if (seen.has(link.photo_id)) continue;
        if (!photoIds.has(link.photo_id)) {
          warnings.push(
            `collection "${row.name}" (${row.id}): link to unknown photo ${link.photo_id}; skipped`
          );
          continue;
        }
        seen.add(link.photo_id);
        photos.push({ _type: "reference", _ref: link.photo_id, _key: link.photo_id });
      }

      const doc: GalleryCollectionDoc = {
        _id: row.id,
        _type: "galleryCollection",
        name: row.name,
        slug: { _type: "slug", current: slug },
        photos,
      };
      if (row.description && row.description.trim()) {
        doc.description = row.description.trim();
      }
      if (row.cover_photo_id) {
        if (photoIds.has(row.cover_photo_id)) {
          doc.coverPhoto = { _type: "reference", _ref: row.cover_photo_id };
        } else {
          warnings.push(
            `collection "${row.name}" (${row.id}): cover_photo_id ${row.cover_photo_id} has no gallery_photo row; coverPhoto omitted`
          );
        }
      }
      return doc;
    }
  );

  // Hard requirement: the "Featured" collection must land on slug `featured`.
  const featured = snapshot.galleryCollections.find((c) => c.name === "Featured");
  if (featured) {
    const doc = collectionDocs.find((d) => d._id === featured.id);
    if (doc?.slug.current !== "featured") {
      fail(
        `Collection "Featured" (${featured.id}) produced slug "${doc?.slug.current}" instead of "featured"`
      );
    }
  } else {
    warnings.push('No collection named exactly "Featured" exists in Supabase');
  }

  return {
    assets,
    galleryPhotos: galleryPhotoDocs,
    projects: projectDocs,
    galleryCollections: collectionDocs,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Sanity writes
// ---------------------------------------------------------------------------

interface AssetResult {
  /** Postgres row id -> Sanity asset _id */
  resolved: Map<string, string>;
  uploaded: number;
  reused: number;
  failed: { rowId: string; blobUrl: string; error: string }[];
}

async function ensureAssets(
  sanity: SanityClient,
  assets: AssetPlan[]
): Promise<AssetResult> {
  const result: AssetResult = {
    resolved: new Map(),
    uploaded: 0,
    reused: 0,
    failed: [],
  };

  // Idempotency: one bulk lookup of everything this script has uploaded before
  // (equivalent to `*[_type == "sanity.imageAsset" && source.id == $id][0]._id`
  // per row, but a single round trip).
  const existing = await sanity.fetch<{ _id: string; sourceId: string | null }[]>(
    `*[_type == "sanity.imageAsset" && source.name == $name]{ _id, "sourceId": source.id }`,
    { name: ASSET_SOURCE_NAME }
  );
  const existingBySourceId = new Map<string, string>();
  for (const asset of existing) {
    if (asset.sourceId) existingBySourceId.set(asset.sourceId, asset._id);
  }

  await mapWithConcurrency(assets, UPLOAD_CONCURRENCY, async (asset, index) => {
    const label = `[${index + 1}/${assets.length}] ${asset.kind} ${asset.rowId}`;
    const reuse = existingBySourceId.get(asset.rowId);
    if (reuse) {
      result.resolved.set(asset.rowId, reuse);
      result.reused++;
      console.log(`  ${label}: reuse ${reuse}`);
      return;
    }
    try {
      const response = await fetch(asset.blobUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      // Original bytes, never re-encoded, so EXIF survives.
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? undefined;
      const uploaded = await sanity.assets.upload("image", buffer, {
        filename: asset.filename,
        contentType,
        source: { name: ASSET_SOURCE_NAME, id: asset.rowId, url: asset.blobUrl },
      });
      result.resolved.set(asset.rowId, uploaded._id);
      result.uploaded++;
      console.log(`  ${label}: uploaded ${uploaded._id} (${buffer.byteLength} bytes)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.failed.push({ rowId: asset.rowId, blobUrl: asset.blobUrl, error: message });
      console.error(`  ${label}: FAILED ${asset.blobUrl} -> ${message}`);
    }
  });

  return result;
}

/**
 * Swap pending asset placeholders for real asset _ids. Documents whose required
 * asset failed to upload are dropped (and reported) rather than written with a
 * dangling reference; references to dropped photos are pruned from collections.
 */
function resolvePlan(
  plan: MigrationPlan,
  assets: Map<string, string>
): { plan: MigrationPlan; dropped: string[] } {
  const dropped: string[] = [];

  const galleryPhotos: GalleryPhotoDoc[] = [];
  for (const doc of plan.galleryPhotos) {
    const assetId = assets.get(doc._id);
    if (!assetId) {
      dropped.push(`galleryPhoto ${doc._id} (asset upload failed)`);
      continue;
    }
    galleryPhotos.push({ ...doc, image: { _type: "image", asset: { _type: "reference", _ref: assetId } } });
  }
  const livePhotoIds = new Set(galleryPhotos.map((d) => d._id));

  const projects: ProjectDoc[] = plan.projects.map((doc) => {
    const images: ProjectImageMember[] = [];
    for (const image of doc.images) {
      const assetId = assets.get(image._key);
      if (!assetId) {
        dropped.push(`project ${doc._id} image ${image._key} (asset upload failed)`);
        continue;
      }
      images.push({ ...image, asset: { _type: "reference", _ref: assetId } });
    }
    return { ...doc, images };
  });

  const galleryCollections: GalleryCollectionDoc[] = plan.galleryCollections.map((doc) => {
    const photos = doc.photos.filter((ref) => {
      if (livePhotoIds.has(ref._ref)) return true;
      dropped.push(`galleryCollection ${doc._id} photo ref ${ref._ref} (photo not migrated)`);
      return false;
    });
    const next: GalleryCollectionDoc = { ...doc, photos };
    if (next.coverPhoto && !livePhotoIds.has(next.coverPhoto._ref)) {
      dropped.push(`galleryCollection ${doc._id} coverPhoto ${next.coverPhoto._ref} (photo not migrated)`);
      delete next.coverPhoto;
    }
    return next;
  });

  return { plan: { ...plan, galleryPhotos, projects, galleryCollections }, dropped };
}

async function writeDocuments<T extends { _id: string; _type: string }>(
  sanity: SanityClient,
  label: string,
  docs: T[]
): Promise<number> {
  let written = 0;
  for (const batch of chunk(docs, MUTATION_BATCH_SIZE)) {
    const tx = sanity.transaction();
    for (const doc of batch) tx.createOrReplace(doc);
    await tx.commit(); // default (sync) visibility so the verification counts below are accurate
    written += batch.length;
    console.log(`  ${label}: createOrReplace ${written}/${docs.length}`);
  }
  return written;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printPlanSummary(snapshot: SupabaseSnapshot, plan: MigrationPlan): void {
  console.log("\nSupabase row counts");
  printTable(
    ["table", "rows"],
    [
      ["project", snapshot.projects.length],
      ["project_image", snapshot.projectImages.length],
      ["project_image_link", snapshot.projectImageLinks.length],
      ["gallery_photo", snapshot.galleryPhotos.length],
      ["gallery_collection", snapshot.galleryCollections.length],
      ["gallery_photo_collection_link", snapshot.galleryPhotoCollectionLinks.length],
    ]
  );

  console.log("\nPlanned Sanity documents");
  printTable(
    ["type", "docs"],
    [
      ["galleryPhoto", plan.galleryPhotos.length],
      ["project", plan.projects.length],
      ["galleryCollection", plan.galleryCollections.length],
      ["image assets", plan.assets.length],
    ]
  );

  console.log("\nProjects");
  printTable(
    ["title", "images", "skills", "end date"],
    plan.projects.map((p) => [
      p.title,
      p.images.length,
      p.skills.length,
      p.projectEndDate ?? "-",
    ])
  );

  console.log("\nCollections");
  printTable(
    ["name", "slug", "photos", "cover"],
    plan.galleryCollections.map((c) => [
      c.name,
      c.slug.current,
      c.photos.length,
      c.coverPhoto ? "yes" : "-",
    ])
  );

  if (plan.warnings.length) {
    console.log(`\nWarnings (${plan.warnings.length})`);
    for (const w of plan.warnings) console.log(`  - ${w}`);
  }
}

async function printVerification(
  sanity: SanityClient,
  snapshot: SupabaseSnapshot,
  written: { galleryPhotos: number; projects: number; galleryCollections: number },
  assets: AssetResult
): Promise<void> {
  const [photoCount, projectCount, collectionCount, assetCount] = await Promise.all([
    sanity.fetch<number>(`count(*[_type == "galleryPhoto"])`),
    sanity.fetch<number>(`count(*[_type == "project"])`),
    sanity.fetch<number>(`count(*[_type == "galleryCollection"])`),
    sanity.fetch<number>(
      `count(*[_type == "sanity.imageAsset" && source.name == $name])`,
      { name: ASSET_SOURCE_NAME }
    ),
  ]);

  console.log("\nVerification");
  printTable(
    ["type", "supabase rows", "written this run", "in sanity"],
    [
      ["galleryPhoto", snapshot.galleryPhotos.length, written.galleryPhotos, photoCount],
      ["project", snapshot.projects.length, written.projects, projectCount],
      [
        "galleryCollection",
        snapshot.galleryCollections.length,
        written.galleryCollections,
        collectionCount,
      ],
    ]
  );
  console.log("\nAssets");
  printTable(
    ["uploaded", "reused", "failed", "in sanity (source=supabase-migration)"],
    [[assets.uploaded, assets.reused, assets.failed.length, assetCount]]
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseSecret = requireEnv("SUPABASE_SECRET_KEY");
  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = opts.dataset ?? requireEnv("NEXT_PUBLIC_SANITY_DATASET");
  const token = opts.dryRun ? undefined : requireEnv("SANITY_API_WRITE_TOKEN");

  console.log(
    `Supabase -> Sanity migration (${opts.dryRun ? "DRY RUN" : "LIVE"}) ` +
      `project=${projectId} dataset=${dataset}`
  );

  const supabase: TypedSupabase = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseSecret,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  console.log("\nReading Supabase...");
  const snapshot = await readSupabase(supabase);
  const plan = buildPlan(snapshot);
  printPlanSummary(snapshot, plan);

  if (opts.dryRun) {
    console.log("\nDry run: nothing was fetched from Vercel Blob or written to Sanity.");
    return;
  }

  const sanity = createSanityClient({
    projectId,
    dataset,
    apiVersion: SANITY_API_VERSION,
    token,
    useCdn: false,
  });

  console.log(`\nStep 1/4: image assets (${plan.assets.length})`);
  const assetResult = await ensureAssets(sanity, plan.assets);
  const { plan: resolved, dropped } = resolvePlan(plan, assetResult.resolved);

  console.log(`\nStep 2/4: galleryPhoto (${resolved.galleryPhotos.length})`);
  const galleryPhotosWritten = await writeDocuments(sanity, "galleryPhoto", resolved.galleryPhotos);

  console.log(`\nStep 3/4: project (${resolved.projects.length})`);
  const projectsWritten = await writeDocuments(sanity, "project", resolved.projects);

  console.log(`\nStep 4/4: galleryCollection (${resolved.galleryCollections.length})`);
  const collectionsWritten = await writeDocuments(
    sanity,
    "galleryCollection",
    resolved.galleryCollections
  );

  await printVerification(
    sanity,
    snapshot,
    {
      galleryPhotos: galleryPhotosWritten,
      projects: projectsWritten,
      galleryCollections: collectionsWritten,
    },
    assetResult
  );

  if (assetResult.failed.length) {
    console.error(`\nFailed blob URLs (${assetResult.failed.length})`);
    for (const f of assetResult.failed) {
      console.error(`  - ${f.rowId}  ${f.blobUrl}\n      ${f.error}`);
    }
  }
  if (dropped.length) {
    console.error(`\nDropped from documents (${dropped.length})`);
    for (const d of dropped) console.error(`  - ${d}`);
  }

  if (assetResult.failed.length || dropped.length) {
    console.error("\nMigration finished WITH ERRORS. Fix the failures above and rerun; reruns are idempotent.");
    process.exitCode = 1;
  } else {
    console.log("\nMigration finished successfully.");
  }
}

main().catch((error: unknown) => {
  console.error("\nFATAL:", error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
