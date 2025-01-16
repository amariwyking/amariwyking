import fs from 'fs';
import path from 'path';

export function findGalleryPhotos(): string[] {
    // Set the posts directory to the folder in the root of the process' current working directory
    const postsDirectory = path.join(process.cwd(), 'public/gallery_photos')
    const fileNames = fs.readdirSync(postsDirectory);

    const photos = fileNames.filter(file =>
        file.endsWith('.jpg')
    )

    return photos
}