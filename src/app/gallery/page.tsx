import GalleryClient from "./GalleryClient";
import { getFeaturedPhotos, getGalleryCollections } from "../lib/gallery-collections";

export default async function Gallery() {
    // Fetch initial data on the server
    const [featuredPhotos, collections] = await Promise.all([
        getFeaturedPhotos(),
        getGalleryCollections()
    ]);

    return (
        <GalleryClient
            initialPhotos={featuredPhotos}
            collections={collections}
        />
    );
}