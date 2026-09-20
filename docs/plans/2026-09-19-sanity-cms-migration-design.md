# Sanity CMS Migration — Design

**Date:** 2026-09-19
**Status:** Design agreed, not yet implemented
**Goal:** Replace Supabase + the hand-built `/admin` route with Sanity Studio as the headless CMS for projects and the photo gallery.

---

## 1. Decisions

| Decision | Choice | Consequence |
|---|---|---|
| Scope | Supabase-backed content only | `project` + gallery move. Blog stays markdown in `/posts`, resume stays `lib/resume-data.ts`. |
| Images | Migrate into Sanity's asset pipeline | Free EXIF, LQIP, dimensions, CDN transforms. Costs a one-time asset migration. |
| Studio host | Embedded at `/studio` | One repo, one deploy. |
| Auth | Remove Civic Auth entirely | Studio brings its own auth + roles. Drops a dependency, middleware, and 4 files. |
| Dataset | Public | All content is public anyway. No read token, no server-side secrets. |
| Live content | **Deferred** | ISR via `revalidate` is enough for a single-editor portfolio. See §4.5. |
| Sanity version | **Pin to v4, not latest** | Latest requires Next 16 + React 19.2. See §5. |

Blog and resume are explicitly **out of scope** — neither is Supabase-backed, so neither carries migration pressure.

---

## 2. Current-state assessment

### 2.1 The type layer

Five files, three unrelated data origins:

| File | Backing store | Fate |
|---|---|---|
| `src/app/types/supabase.ts` (425 lines, generated) | Postgres — 8 tables | **Delete** |
| `src/app/types/database.ts` | re-export of `Tables<>` | **Delete** |
| `src/app/types/project-showcase.ts` | view model | **Keep props, retype payloads** |
| `src/app/types/blogs.ts` | `/posts/*.md` | Untouched |
| `src/app/types/resume.ts` | hardcoded TS | Untouched |

Only the two generated/derived files die. `project-showcase.ts` is a *view model* — the shape GROQ projections target, not something to discard.

### 2.2 Defects the current model permits

Each is a consequence of doing relational joins by hand in application code, and each becomes unrepresentable under a document model.

**a. Project images never resolve.**
`src/app/lib/project-showcase-data.ts:102` maps `img.blob_url` over `dbProject.images`. But `project.images` is `string[] | null` (`types/supabase.ts:154`) — an array of UUID *strings*. `img.blob_url` is `undefined` for every image. The `project_image_link` → `project_image` join is never performed at read time.

Currently invisible, because `ProjectCard.tsx` never renders `images` at all — it reads only `title`, `skills`, `description`, `project_end_date`, `featured`.

**b. `featured` and `order` have no columns.**
`project-showcase-data.ts:107-108` reads `dbProject.featured` and `dbProject.order`; neither exists in the `project` table. `getFeaturedProjects()` always returns `[]`, `getSortedProjects()` sorts everything to 999, and the badge at `ProjectCard.tsx:165` can never render.

Both (a) and (b) compile only because the transform's parameter is typed `any` (`project-showcase-data.ts:94`).

**c. An N+1 loop computing a field nothing reads.**
`lib/gallery-collections.ts:52-65` fires one count query per collection to populate `photo_count`. `CollectionDrawer.tsx` reads only `collection.id` and `collection.name`. The counts are discarded.

**d. A write-only taxonomy.**
`actions/project.ts:243-280` runs a find-or-create loop maintaining `skill` and `project_skill_link`. No read path touches them — every render uses the denormalized `project.skills` array. Two tables and ~40 lines of dual-write serving nothing.

**e. Hardcoded localhost.**
`src/actions/gallery.ts:238` fetches `http://localhost:3000/api/gallery/photo`. Broken in production.

**f. Dead code and dependencies.**
- `lib/gallery.ts` (legacy filesystem-EXIF path) — zero callers.
- `components/landing/Projects.tsx` — zero importers; a stale duplicate of `app/projects/page.tsx`.
- `api/images/update-caption/route.ts` — no caller; only a stale middleware matcher references the path.
- `next-auth` — in `package.json`, never imported.
- `BETTER_AUTH_SECRET` — in `.env.local`, never read.
- `public/gallery_photos/` (27 files) — referenced only by `lib/gallery.ts` (dead) and `sampleProjects` (deleted).

**g. Browser client in server components.**
`app/projects/page.tsx` calls `createClient()` (the *browser* client) inside an async server component, duplicating the query in `app/page.tsx`.

### 2.3 What the components actually consume

The migration surface is far smaller than the table count suggests:

- **Projects:** `title`, `skills`, `description`, `project_end_date`, `featured` — five scalars.
- **Gallery:** `blob_url` at exactly one site (`gallery/PhotoCollection.tsx:120`), plus `id` and `name`.

This is why generated types can own the payload shapes — rewriting consumers is a handful of lines.

---

## 3. Target content model

Three document types replace eight tables.

### `project`

Replaces `project`, `project_image`, `project_image_link`, `project_skill_link`, `skill`.

```ts
defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title', type: 'string',
      validation: (r) => r.required().min(3).max(255),
    }),
    defineField({
      name: 'description', type: 'text',
      validation: (r) => r.required().min(20),
    }),
    defineField({
      name: 'skills', type: 'array', of: [{ type: 'string' }],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: 'images', type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true, metadata: ['lqip', 'dimensions'] },
        fields: [
          { name: 'caption', type: 'string', validation: (r) => r.max(255) },
          { name: 'alt', type: 'string' },
        ],
      }],
    }),
    defineField({ name: 'projectEndDate', type: 'date' }),
    defineField({ name: 'projectLink', type: 'url' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
  ],
})
```

`featured` becomes a **real field**, fixing defect (b). Array position handles image ordering, fixing (a). `skills` stays a plain string array — nothing reads a taxonomy, so the normalized tables from (d) are not recreated.

Validation rules ported from `actions/project.ts` now live in the schema, enforcing in the Studio UI rather than after submit.

**Deliberately omitted:**
- `displayOrder` — ordering by `featured desc, projectEndDate desc` is natural for a portfolio and needs no manual bookkeeping. Add `@sanity/orderable-document-list` only if hand-ordering is genuinely wanted.
- `slug` — there is no `/projects/[slug]` route. Add it with the route.

### `galleryPhoto`

Replaces `gallery_photo`.

```ts
defineType({
  name: 'galleryPhoto',
  type: 'document',
  fields: [
    defineField({ name: 'photoName', type: 'string' }),
    defineField({
      name: 'image', type: 'image',
      options: { hotspot: true, metadata: ['exif', 'lqip', 'dimensions'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'alt', type: 'string' }),
  ],
})
```

Three columns **disappear**. `f_stop`, `iso`, and `shutter_speed` are read from `asset->metadata.exif` as `FNumber`, `ISO`, `ExposureTime` — Sanity parses EXIF on ingest. `filename` disappears too; the asset already carries `originalFilename`.

A behavioural improvement worth noting: `formatShutterSpeed` currently runs at *write* time (`actions/gallery.ts:131-138`) and stores `"1/250"` permanently. Under Sanity the raw `ExposureTime` is stored and formatted at render. Keep `formatShutterSpeed` as a display util; delete the write-path copy.

The new `alt` field also fixes `PhotoCollection.tsx:120`, which currently renders `alt=""` on every gallery image.

### `galleryCollection`

Replaces `gallery_collection` **and** `gallery_photo_collection_link`.

```ts
defineType({
  name: 'galleryCollection',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required().max(255) }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', type: 'text', validation: (r) => r.max(1000) }),
    defineField({
      name: 'photos', type: 'array',
      of: [{ type: 'reference', to: [{ type: 'galleryPhoto' }] }],
    }),
    defineField({ name: 'coverPhoto', type: 'reference', to: [{ type: 'galleryPhoto' }] }),
  ],
})
```

The link table and its `display_order` column vanish — order is array position, with drag-to-reorder free in Studio. Photos stay references (not inline objects) because a photo can belong to several collections.

**Replace the magic string.** `lib/gallery-collections.ts:113` finds the featured collection with `.eq("name", "Featured")`, so renaming it in the UI breaks the homepage. Match on `slug.current == "featured"` instead — this is the one slug that earns its place.

`description` and `coverPhoto` are retained as fields because the data exists and is worth migrating, but they are **not projected** into any query until something renders them (see §4.2).

---

## 4. The data layer

There are no REST routes to build. Six of the eight current API routes exist solely to serve `/admin`; Studio removes the need. Reads become GROQ from server components.

### 4.1 File layout

```
sanity.config.ts                        # root — basePath: '/studio'
sanity.cli.ts                           # root — projectId/dataset for CLI + typegen
src/sanity/
  env.ts                                # projectId, dataset, apiVersion
  lib/client.ts                         # createClient
  lib/image.ts                          # urlFor() builder
  schemaTypes/
    index.ts
    project.ts
    galleryPhoto.ts
    galleryCollection.ts
  queries.ts
src/app/studio/[[...tool]]/page.tsx     # embedded Studio
sanity.types.ts                         # GENERATED — do not edit
```

**One** new route, against **nine** deleted.

Three details that are easy to miss:
- `sanity.config.ts` must set `basePath: '/studio'` or the embedded Studio will not route correctly.
- `sanity.cli.ts` needs `projectId` and `dataset` or the CLI and typegen commands fail.
- Client config must pin `apiVersion` to a date string and set `perspective: 'published'`, `useCdn: true`.

`tsconfig.json` already has `include: ["**/*.ts"]`, so root-level `sanity.types.ts` and `sanity.config.ts` are picked up with no config change.

### 4.2 Queries — direct replacements

Three queries cover every current read path.

```groq
// PROJECTS_QUERY
// replaces: supabase.from("project").select() + transformProjectForShowcase()
//           + getSortedProjects() + getFeaturedProjects()
*[_type == "project"] | order(featured desc, projectEndDate desc) {
  _id,
  title,
  description,
  skills,
  featured,
  projectEndDate,
  projectLink,
  images[]{
    _key,
    "url": asset->url,
    "lqip": asset->metadata.lqip,
    "dimensions": asset->metadata.dimensions,
    caption,
    alt
  }
}
```

Sorting moves into the query, so both JS sort helpers are deleted rather than fixed. `images[]` resolves in the same round trip — defect (a) becomes unrepresentable.

```groq
// COLLECTIONS_QUERY
// replaces: getGalleryCollections() AND its N+1 count loop
*[_type == "galleryCollection"] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current
}
```

`CollectionDrawer.tsx` reads only `id` and `name`. Projecting `photo_count` or `coverPhoto` here would reproduce exactly the defect called out in (c) — computing data nothing renders. Add them when a component needs them; `count(photos)` is a one-line addition at that point.

```groq
// PHOTOS_BY_COLLECTION_QUERY   $slug
// replaces: getPhotosByCollection() AND getFeaturedPhotos()
*[_type == "galleryCollection" && slug.current == $slug][0].photos[]->{
  _id,
  photoName,
  alt,
  "url": image.asset->url,
  "lqip": image.asset->metadata.lqip,
  "dimensions": image.asset->metadata.dimensions,
  "exif": image.asset->metadata.exif{ FNumber, ISO, ExposureTime }
}
```

Array order *is* display order — no join, no sort, no `display_order`. Featured photos are the same query with `$slug = "featured"`, collapsing two loaders into one.

Projections use Sanity-native names (`_id`, `projectEndDate`) rather than aliasing back to `blob_url` / `project_end_date`. Since typegen owns the payload types, aliasing would bake Postgres naming into the codebase permanently to save about four lines in `ProjectCard.tsx`.

### 4.3 Round-trip comparison

Gallery page load, with N collections:

| | Today | After |
|---|---|---|
| `getFeaturedPhotos()` | 2 (find by name, then join) | 1 |
| `getGalleryCollections()` | 1 + N (count per collection) | 1 |
| **Total** | **3 + N** | **2** |

At N=5 that is 8 round trips to 2, both CDN-cached.

### 4.4 Types via typegen

```json
"scripts": {
  "typegen": "sanity schema extract && sanity typegen generate"
}
```

Typegen derives result types **from the GROQ query strings themselves**, producing `PROJECTS_QUERYResult` and friends in `sanity.types.ts`. A projection and its type cannot drift.

- **Delete:** `types/supabase.ts`, `types/database.ts`.
- **Keep and retype:** `types/project-showcase.ts` — the props interfaces (`ProjectShowcaseProps`, `ProjectCardProps`, `ProjectDetailsProps`, `SkillCarouselProps`) survive; the hand-written `ProjectShowcaseData` and `ProjectImage` payload types are replaced by generated ones.

Run `npm run typegen` after every schema change; wire it into CI to catch drift.

**Expect the first typecheck to fail, and expect that to be useful.** `transformProjectForShowcase(dbProject: any)` erases types — the `any` is precisely why defects (a) and (b) compile today. Generated types have no such escape hatch, so nullability the transform silently swallowed becomes a compile error:

| Field | Generated type | Consumer expects | Fix |
|---|---|---|---|
| `skills` | `string[] \| null` | `SkillCarouselProps.skillsData: string[]` | `skills ?? []` |
| `images` | `Array<…> \| null` | iterated | `images ?? []` |
| `projectEndDate` | `string \| null` | already guarded at `ProjectCard.tsx:150` | none |

A handful of `??` additions on first typecheck. Each one is a latent bug surfacing.

### 4.5 Caching — why not Live Content

The obvious choice is `defineLive()` from `next-sanity`, giving real-time published-content streaming and draft previews. It is **deferred**, because it costs a read token, a `<SanityLive />` mount in the root layout, an `api/draft-mode/enable` route, and a private dataset — to solve a problem a single editor on a portfolio does not have.

Instead: public dataset, `useCdn: true`, and

```ts
client.fetch(PROJECTS_QUERY, {}, { next: { revalidate: 60 } })
```

If sub-minute publishing ever matters, the upgrade path is a Sanity webhook hitting a `revalidateTag` route — additive, and it does not invalidate anything built here.

The `revalidatePath("/gallery")` / `revalidatePath("/projects")` calls disappear along with the server actions containing them.

### 4.6 Access control

With `src/middleware.ts` deleted, `/studio` is publicly reachable but self-protecting: Sanity Studio requires a Sanity login and project membership before rendering anything. No app-level gate is needed.

A public dataset means all *published* content is world-readable through the Sanity API. For a portfolio, that content is public by intent. Drafts remain private regardless.

---

## 5. Dependencies and version constraints

**This repo cannot take the latest Sanity.** Current stack: Next **15.3.6**, React **19.0.0** (pinned exactly, with `overrides`), Node **22.22.0**.

| Package | Latest | Requires | Fits? |
|---|---|---|---|
| `sanity` | 6.15.0 | `react ^19.2.2`, `node >=22.12` | ✗ React 19.0.0 |
| `next-sanity` | 13.3.4 | `next ^16.0.0-0`, `react ^19.2.3` | ✗ Next 15.3.6 |

Installing latest would drag a Next 16 **and** React 19.2 upgrade into a CMS migration — two framework majors bundled with a data-layer rewrite, with no way to tell which one broke a given page.

**Pin to the v4 line instead. No framework upgrade required:**

```
sanity@^4.22.1              react ^18||^19 ✓   node >=20.19 <22 || >=22.12 ✓
next-sanity@^11.6.13        next ^15.1.0-0 ✓   sanity ^4.10.0 ✓
@sanity/vision@^4.22.1      react ^18||^19 ✓
@sanity/image-url@^1.1.0    (no peer deps)
styled-components@^6.1.15   required peer of sanity AND @sanity/vision — not currently installed
```

Two traps in that table:

- **`styled-components` is not optional.** It is a hard peer of both `sanity` and `@sanity/vision`, and is absent from `package.json` today. Omitting it produces a confusing runtime failure inside Studio, not an install error.
- **The Node range has a hole**: `>=20.19 <22 || >=22.12`. Node **22.0–22.11 is excluded**.

**Node version — resolved 2026-09-19.** Local is 22.22.0 ✓. The Vercel project (`amariwyking`, `prj_ZXYx1XXu4uRT2BrVglxXHpaa5Rze`) was on **`20.x`**, which was a problem twice over:

1. Vercel's `20.x` floats to 20.19.x, so it cleared Sanity's `>=20.19` bound by a single patch version — on a tag that moves without notice.
2. **Node 20 reached end-of-life in April 2026.** Production was building on an EOL runtime, independent of this migration.

Now set to **`22.x`**, verified by re-reading the project from the Vercel API. It matches local and sits well inside Sanity's range rather than on its edge.

**This applies to the next deploy, not retroactively.** The most recent production build (2025-12-16) ran on Node 20, so nothing has yet exercised 22.x. Trigger a deploy *before* Phase 1 adds Sanity to the dependency tree — otherwise a runtime failure and a dependency failure arrive in the same build and cannot be told apart.

Upgrading to `sanity@6` / `next-sanity@13` is a reasonable follow-up *after* this migration lands and after Next 16 is adopted on its own merits. It is not a prerequisite.

---

## 6. Migration script

One-off, idempotent, at `scripts/migrate-supabase-to-sanity.ts`:

1. Read Supabase rows using the existing `SUPABASE_SECRET_KEY`.
2. For each image: `fetch(blob_url)` → `client.assets.upload('image', buffer, { filename })`. Upload **original bytes, not re-encoded** — Sanity parses EXIF on ingest and re-encoding strips it.
3. `client.createOrReplace({ _id, _type, ... })`. **Reuse the Postgres UUIDs as Sanity `_id`s** — Sanity document IDs are arbitrary strings matching `^[a-zA-Z0-9._-]+$`, which UUIDs satisfy. Identity is preserved and reruns are idempotent.
4. Order matters: `galleryPhoto` → `project` → `galleryCollection`. Strong references require their target to exist, so collections go last.
5. Resolve `gallery_photo_collection_link` rows ordered by `display_order` into each collection's `photos` array.
6. Derive `slug` for each collection from `name`; ensure the one currently named `"Featured"` lands on `featured`.
7. Verify counts against Supabase before decommissioning.

Run against a `staging` dataset first, then `production`.

Sanity's free tier (10k documents, 5GB assets, 2 admin seats) is far above this dataset's size — no plan decision needed.

---

## 7. Deletion manifest

**Files removed (~40):**

```
src/middleware.ts                             ← Civic withAuth; every matcher targets a deleted route
src/utils/supabase/{admin,client,server}.ts
src/utils/auth.ts
src/app/types/{supabase,database}.ts
src/actions/{gallery,project}.ts
src/app/api/gallery/**                        (6 routes)
src/app/api/images/update-caption/route.ts    (dead: no caller)
src/app/api/upload/route.ts
src/app/api/auth/[...civicauth]/route.ts
src/app/admin/**                              (5 files)
src/app/auth/page.tsx
src/app/lib/gallery-collections.ts            → src/sanity/queries.ts
src/app/lib/gallery.ts                        (dead: zero callers)
src/app/lib/project-showcase-data.ts          (sample data + broken transforms)
src/app/gallery/upload/page.tsx
src/app/projects/upload/page.tsx
src/app/components/forms/**                   (3 files)
src/app/components/shared/forms/**            (7 files — every consumer is in the list above)
src/app/components/landing/Projects.tsx       (dead: zero importers)
public/gallery_photos/**                      (27 files — only dead code referenced them)
```

**Files modified:**

- `src/app/layout.tsx` — drop the `CivicAuthProvider` wrapper (lines 4, 50-52). Easy to miss; removing the dependency without this breaks the build.
- `next.config.ts` — drop the `createCivicAuthPlugin` wrapper. **`remotePatterns` changes in two steps**: *add* `cdn.sanity.io` in Phase 3 (before any read flips), *remove* the Vercel Blob host in Phase 4. Both hosts must coexist during the flip.
- `.gitignore` — add `.sanity/` and `/dist` (Studio build artifacts).
- `package.json` — add the `typegen` script.
- `src/app/gallery/PhotoCollection.tsx:120` — `currentPhoto.blob_url` → `urlFor(...)`, plus LQIP blur placeholder and a real `alt`.
- `src/app/components/projects/ProjectCard.tsx` — `project.project_end_date` → `project.projectEndDate` (lines 150-154).
- `src/app/page.tsx`, `src/app/projects/page.tsx`, `src/app/gallery/page.tsx` — swap to `client.fetch`.

**Dependencies removed:** `@supabase/ssr`, `@supabase/supabase-js`, `@civic/auth`, `exifr`, `@vercel/blob`, `next-auth` (already dead), `@types/uuid`.

**Env vars removed:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `BETTER_AUTH_SECRET` (already dead).

**Env vars added:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`. No token — the dataset is public.

**Open item:** `src/app/gallery/panel/page.tsx` + `ImagePanel.tsx` hardcode a Vercel Blob URL *and* hardcoded EXIF values. It is a scratch route. Dropping the blob `remotePattern` breaks it at runtime, so decide in Phase 4: delete it, or repoint it at a migrated `galleryPhoto`.

---

## 8. Phased execution

Branch `feat/sanity-cms` from `main`. As of 2026-09-19 `main` is at `05dd57e` and carries all design-system work, so there is no in-flight branch to sequence around — the components this migration touches (`ProjectCard`, `PhotoCollection`, `page.tsx`) are not contended.

Each phase leaves the site working.

**Phase 0 — Access.** Authenticate the Sanity MCP (`npx sanity@latest mcp configure`; the current token is expired). Create the project and a `production` dataset, set public. **Register CORS origins** for `http://localhost:3000` and the production domain — the browser-side Studio calls `api.sanity.io` and fails silently without them. ~~Set the Vercel project's Node version to 22.x~~ — **done 2026-09-19** (see §5); trigger one deploy on the new runtime before Phase 1. Add env vars locally and in Vercel.

**Phase 1 — Studio, additive.** Install the pinned versions from §5, **including `styled-components`**. Add `sanity.config.ts` (with `basePath`), `sanity.cli.ts`, the three schema types, and `app/studio/[[...tool]]/page.tsx`. Run `sanity schema deploy` so the MCP `get_schema` tool works against the live schema. Site still reads Supabase.
**Verify:** Studio loads and renders correctly at `/studio`; all three types creatable; `npm run build && npm run lint` clean.

**Phase 2 — Data migration.** Write and dry-run the script; run against `production`. Both systems now hold the data; the site still reads Supabase.
**Verify:** document counts match Supabase row counts; spot-check `metadata.exif` on migrated photos *before* trusting the EXIF path in Phase 3.

**Phase 3 — Flip reads, one route at a time.** Add `cdn.sanity.io` to `remotePatterns`. Add the client/query layer, run typegen, resolve the nullability errors from §4.4. Convert in order: `/projects` → `/` → `/gallery`.
**Verify:** see §8.1. Each route must match before moving to the next.

**Phase 4 — Delete.** Remove everything in the manifest, including `src/middleware.ts` and the `CivicAuthProvider` wrapper. Drop the Vercel Blob `remotePattern`. Resolve the `/gallery/panel` open item.
**Verify:** `npm run build && npm run lint` clean; `grep -rn "supabase\|civic\|exifr\|blob_url" src/` returns nothing.

**Phase 5 — Decommission.** Pause the Supabase project (don't delete) for a rollback window. Delete after a stable period.

### 8.1 Verifying without a test suite

The repo has **no test infrastructure** — no `test` script, no jest/vitest/playwright. Every "verify" step above is manual, and that constraint is the reason Phase 3 flips one route at a time rather than all three at once.

Concrete method per route:

```bash
# before flipping
curl -s localhost:3000/projects > /tmp/before.html
# after flipping
curl -s localhost:3000/projects > /tmp/after.html
diff <(grep -oE '<h[1-3][^>]*>[^<]+' /tmp/before.html) \
     <(grep -oE '<h[1-3][^>]*>[^<]+' /tmp/after.html)
```

Headings and project titles should be identical; image `src` attributes are *expected* to change from blob to `cdn.sanity.io`. Project images appearing where none did before is the fix for defect (a) landing, not a regression.

`npm run build && npm run lint` must stay clean at every phase boundary. Rollback before Phase 5 is `git revert` — Supabase stays live and untouched throughout.

Adding a test harness is out of scope here, but its absence is the single largest source of residual risk in this plan.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| **Version incompatibility.** Latest Sanity needs Next 16 + React 19.2; repo is Next 15.3.6 + React 19.0.0. | Pin to the v4 line per §5. Do not `npm install sanity@latest`. |
| **Missing `styled-components`.** Hard peer of `sanity`; absent today. | Install explicitly in Phase 1. Failure mode is a runtime break inside Studio, not an install error. |
| **`@types/react` override conflict.** `package.json` pins `@types/react: 19.0.2` via `overrides`; Sanity's types may want newer. | If typecheck fails in Phase 1, relax the override to `^19`. Check before writing any schema. |
| **Tailwind v4 preflight leaking into Studio.** A nested `app/studio/layout.tsx` does **not** help — App Router layouts compose, so the root layout's `globals.css` still applies. The real fix is route groups with two root layouts (`app/(site)/` + `app/(studio)/`), which means moving every route. | Don't pre-emptively restructure. Ship the plain `/studio` route in Phase 1 and look at it. Only if Studio actually renders wrong, do the route-group split — it is mechanical and can happen at any point. |
| **Turbopack.** Dev runs `next dev --turbopack`; Studio's bundle has historically been sensitive to it. | If Studio misbehaves only in dev, run `next dev` without the flag for Studio work. Not a production concern. |
| **Deleting Civic breaks the build in three places, not one.** `next.config.ts`, `src/app/layout.tsx`, and `src/middleware.ts` all import it. | All three are in the manifest. Remove together in Phase 4. |
| **Asset upload failures mid-migration.** | Idempotent script keyed on preserved UUIDs; rerun safely. Log every failed `blob_url`. |
| **Losing EXIF on migration.** | Upload original bytes, never re-encoded. Verify `metadata.exif` in Phase 2 before deleting the Supabase columns. |
| **No automated tests.** | One route at a time, with the diff method in §8.1. Accepted, not solved. |
| **Public dataset exposure.** | Only published content is readable, and it is public by intent. Drafts stay private. Revisit only if non-public content types are ever added. |

---

## 10. Out of scope

Deliberately excluded, with rationale:

- **Blog.** Filesystem markdown works and carries no migration pressure. A `post` type with Portable Text is a clean follow-up once Studio is proven.
- **Resume.** `/resume` is currently a Creddle iframe. Moving `resume-data.ts` into Sanity would trade the compile-time-checked `Skill` union in `types/resume.ts` for runtime references — a real loss with no current payoff.
- **Live Content API / visual editing.** See §4.5. Additive later.
- **Manual project ordering.** See §3. `@sanity/orderable-document-list` if it becomes a real need.
- **Next 16 / Sanity v6 upgrade.** See §5. Worth doing on its own merits, separately.
- **Test infrastructure.** See §8.1. The largest residual risk, and the obvious next investment.
