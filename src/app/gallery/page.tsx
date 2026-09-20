import GalleryClient from "./GalleryClient";
import { getFeaturedPhotos, getGalleryCollections } from "@/sanity/lib/fetch";

export default async function Gallery() {
  const [featuredPhotos, collections] = await Promise.all([
    getFeaturedPhotos(),
    getGalleryCollections(),
  ]);

  return (
    <GalleryClient initialPhotos={featuredPhotos} collections={collections} />
  );
}
