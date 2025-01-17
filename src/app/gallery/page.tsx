import { getPhotosWithData } from "../lib/gallery";
import PhotoCollection from "./PhotoCollection";

export default async function Gallery() {
    const photosData = await getPhotosWithData()

    return (
        <main className="flex min-h-screen flex-col place-content-center p-8">
            <div className="items-center">
                <PhotoCollection photosData={photosData}/>
            </div>
        </main>
    );
}