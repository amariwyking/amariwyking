import type {
  COLLECTIONS_QUERYResult,
  FEATURED_PHOTOS_QUERYResult,
  PHOTOS_BY_COLLECTION_QUERYResult,
  PROJECTS_QUERYResult,
} from "../../../sanity.types";
import {
  COLLECTIONS_QUERY,
  FEATURED_PHOTOS_QUERY,
  PHOTOS_BY_COLLECTION_QUERY,
  PROJECTS_QUERY,
} from "../queries";
import { client } from "./client";

const REVALIDATE_SECONDS = 60;

/**
 * `next.revalidate` is a Next.js server-side fetch extension. The gallery
 * fetches collections from the browser (public dataset, no token), so only
 * attach it when running on the server.
 */
function fetchOptions() {
  return typeof window === "undefined"
    ? { next: { revalidate: REVALIDATE_SECONDS } }
    : {};
}

/**
 * EXIF shape for gallery photos. Sanity's built-in `sanity.imageMetadata`
 * schema does not declare `exif`, so typegen infers it as `null` even though
 * `metadata: ["exif"]` on the image field stores it at runtime. This type is
 * the one place that knowledge lives; the loaders below narrow to it.
 */
export type PhotoExif = {
  FNumber?: number | null;
  ISO?: number | null;
  ExposureTime?: number | null;
} | null;

type RawPhoto = NonNullable<PHOTOS_BY_COLLECTION_QUERYResult>[number];
/** A gallery photo with a resolvable asset URL. */
export type GalleryPhoto = Omit<RawPhoto, "exif" | "url"> & {
  url: string;
  exif: PhotoExif;
};
export type GalleryCollection = COLLECTIONS_QUERYResult[number];
/** One row of PROJECTS_QUERY (distinct from the generated `Project` document type). */
export type ProjectListItem = PROJECTS_QUERYResult[number];

/**
 * The queries already filter on `defined(image.asset)`, so `url` is non-null
 * at runtime; this only narrows the generated type (and `exif`, see above).
 */
function toGalleryPhotos(
  photos: PHOTOS_BY_COLLECTION_QUERYResult | FEATURED_PHOTOS_QUERYResult
): GalleryPhoto[] {
  const withUrl = (photos ?? []).filter(
    (photo): photo is RawPhoto & { url: string } => photo?.url != null
  );
  // Widening `exif` from typegen's `null` to PhotoExif needs an explicit cast.
  return withUrl as GalleryPhoto[];
}

export async function getProjects(): Promise<PROJECTS_QUERYResult> {
  return client.fetch(PROJECTS_QUERY, {}, fetchOptions());
}

export async function getGalleryCollections(): Promise<COLLECTIONS_QUERYResult> {
  return client.fetch(COLLECTIONS_QUERY, {}, fetchOptions());
}

export async function getPhotosByCollection(
  slug: string
): Promise<GalleryPhoto[]> {
  const photos = await client.fetch(
    PHOTOS_BY_COLLECTION_QUERY,
    { slug },
    fetchOptions()
  );
  return toGalleryPhotos(photos);
}

/** Photos of the "featured" collection, or every photo if none exists. */
export async function getFeaturedPhotos(): Promise<GalleryPhoto[]> {
  return toGalleryPhotos(
    await client.fetch(FEATURED_PHOTOS_QUERY, {}, fetchOptions())
  );
}
