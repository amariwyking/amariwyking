import { defineQuery } from "next-sanity";

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(featured desc, projectEndDate desc) {
    _id, title, description, skills, featured, projectEndDate, projectLink,
    images[]{
      _key,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "dimensions": asset->metadata.dimensions,
      caption,
      alt
    }
  }
`);

export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience"] | order(startDate desc) {
    _id, employer, role, startDate, endDate, type, notes, skills, question
  }
`);

export const COLLECTIONS_QUERY = defineQuery(`
  *[_type == "galleryCollection"] | order(_createdAt desc) {
    _id, name, "slug": slug.current
  }
`);

// Photo projection shared by the gallery queries. The leading filter drops
// dangling/unpublished references (which dereference to null) and photos
// whose asset is missing, so consumers never see a null element or url.
const PHOTO_PROJECTION = `[defined(image.asset)]{
    _id, photoName, alt,
    "url": image.asset->url,
    "lqip": image.asset->metadata.lqip,
    "dimensions": image.asset->metadata.dimensions,
    "exif": image.asset->metadata.exif{ FNumber, ISO, ExposureTime }
  }`;

export const PHOTOS_BY_COLLECTION_QUERY = defineQuery(`
  *[_type == "galleryCollection" && slug.current == $slug][0].photos[]->${PHOTO_PROJECTION}
`);

// The "featured" collection's photos in array order. Falls back to every photo
// only when no such collection exists (an existing-but-empty collection
// yields [] and does not fall back). One round trip either way.
export const FEATURED_PHOTOS_QUERY = defineQuery(`
  coalesce(
    *[_type == "galleryCollection" && slug.current == "featured"][0].photos[]->${PHOTO_PROJECTION},
    *[_type == "galleryPhoto"] | order(_createdAt desc)${PHOTO_PROJECTION}
  )
`);
