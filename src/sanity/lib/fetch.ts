import type {
  ALL_PHOTOS_QUERYResult,
  COLLECTIONS_QUERYResult,
  PHOTOS_BY_COLLECTION_QUERYResult,
  PROJECTS_QUERYResult,
} from "../../../sanity.types";
import {
  ALL_PHOTOS_QUERY,
  COLLECTIONS_QUERY,
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

type RawPhoto = ALL_PHOTOS_QUERYResult[number];
/** A gallery photo with a resolvable asset URL. */
export type GalleryPhoto = Omit<RawPhoto, "exif" | "url"> & {
  url: string;
  exif: PhotoExif;
};
export type GalleryCollection = COLLECTIONS_QUERYResult[number];
export type Project = PROJECTS_QUERYResult[number];

/** Drops photos whose asset has no URL (nothing to render) and narrows `exif`. */
function toGalleryPhotos(
  photos: PHOTOS_BY_COLLECTION_QUERYResult | ALL_PHOTOS_QUERYResult
): GalleryPhoto[] {
  return (photos ?? []).filter(
    (photo): photo is RawPhoto & { url: string } => photo.url !== null
  ) as GalleryPhoto[];
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

/**
 * Photos from the "featured" collection; falls back to every photo when no
 * such collection exists (the migrated data has none).
 */
export async function getFeaturedPhotos(): Promise<GalleryPhoto[]> {
  const featured = await getPhotosByCollection("featured");
  if (featured.length > 0) return featured;
  return toGalleryPhotos(
    await client.fetch(ALL_PHOTOS_QUERY, {}, fetchOptions())
  );
}
