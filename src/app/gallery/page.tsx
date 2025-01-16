import { findGalleryPhotos } from "../lib/gallery";
import PhotoCollection from "./PhotoCollection";

export default function Gallery() {
    const photos_dir = '/gallery_photos'
    const photoFilenames = findGalleryPhotos()
    // console.log(`${photos_dir}/${photoFilenames[0]}`)

    return (
        <main className="flex min-h-screen flex-col place-content-center p-8">
            <div className="items-center">
                <PhotoCollection directory={photos_dir} filenames={photoFilenames} />
            </div>
        </main>
    );
}