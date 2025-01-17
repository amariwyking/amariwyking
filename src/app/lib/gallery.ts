import exifr from 'exifr';
import fs from 'fs';
import path from 'path';

export interface PhotoMetadata {
    fileName: string,
    filePath: string,
    settings: {
        fStop?: string | null,
        iso?: string | null,
        shutterSpeed?: string | null,
    },
    // rawExif: exif // Include raw data for debugging
}

const photosDirectory = path.join(process.cwd(), 'public/gallery_photos')
const publicDirectory = '/gallery_photos'

export function findGalleryPhotos(): string[] {
    // Set the posts directory to the folder in the root of the process' current working directory
    const fileNames = fs.readdirSync(photosDirectory);

    const photos = fileNames.filter(file =>
        file.endsWith('.jpg')
    )

    return photos
}

export async function getPhotosWithData(): Promise<PhotoMetadata[]> {
    const fileNames = findGalleryPhotos()

    const photoMetadata = await Promise.all(
        fileNames.map(async (fileName): Promise<PhotoMetadata> => {
            const fsPath = path.join(photosDirectory, fileName)
            const publicPath = `${publicDirectory}/${fileName}`
            const buffer = fs.readFileSync(fsPath)

            // Request specific EXIF tags
            const exif = await exifr.parse(buffer, {
                pick: ['FNumber', 'ISO', 'ExposureTime', 'ShutterSpeedValue']
            })

            // Format shutter speed into a readable string
            const formatShutterSpeed = (exposureTime: number): string => {
                if (exposureTime >= 1) {
                    return `${exposureTime.toFixed(1)}s`
                } else {
                    const fraction = Math.round(1 / exposureTime);
                    return `1/${fraction}`
                }
            }

            const cameraMetadata = {
                fStop: exif?.FNumber || null,
                iso: exif?.ISO || null,
                shutterSpeed: exif?.ExposureTime ? formatShutterSpeed(exif.ExposureTime) : null
            }

            const fileData: PhotoMetadata = {
                fileName: fileName,
                filePath: publicPath,
                settings: cameraMetadata,
            }

            // return a PhotoMetadata object
            return fileData
        })
    );

    // Filter out photos with missing metadata if needed
    const validPhotos = photoMetadata.filter(photo =>
        photo.settings.fStop !== null &&
        photo.settings.iso !== null &&
        photo.settings.shutterSpeed !== null
    );

    // Log any photos with missing metadata
    const missingMetadata = photoMetadata.filter(photo =>
        photo.settings.fStop === null ||
        photo.settings.iso === null ||
        photo.settings.shutterSpeed === null
    );

    if (missingMetadata.length > 0) {
        console.warn('Photos with missing metadata:',
            missingMetadata.map(p => ({
                fileName: p.fileName,
                missing: {
                    fStop: !p.settings.fStop,
                    iso: !p.settings.iso,
                    shutterSpeed: !p.settings.shutterSpeed
                }
            }))
        );
    }

    return validPhotos;
}
