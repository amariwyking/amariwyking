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

export const COLLECTIONS_QUERY = defineQuery(`
  *[_type == "galleryCollection"] | order(_createdAt desc) {
    _id, name, "slug": slug.current
  }
`);

export const PHOTOS_BY_COLLECTION_QUERY = defineQuery(`
  *[_type == "galleryCollection" && slug.current == $slug][0].photos[]->{
    _id, photoName, alt,
    "url": image.asset->url,
    "lqip": image.asset->metadata.lqip,
    "dimensions": image.asset->metadata.dimensions,
    "exif": image.asset->metadata.exif{ FNumber, ISO, ExposureTime }
  }
`);

export const ALL_PHOTOS_QUERY = defineQuery(`
  *[_type == "galleryPhoto"] | order(_createdAt desc) {
    _id, photoName, alt,
    "url": image.asset->url,
    "lqip": image.asset->metadata.lqip,
    "dimensions": image.asset->metadata.dimensions,
    "exif": image.asset->metadata.exif{ FNumber, ISO, ExposureTime }
  }
`);
