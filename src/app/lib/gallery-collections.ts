import { Tables } from "@/app/types/supabase";
import { createClient } from "@/utils/supabase/client";

export type GalleryPhoto = Tables<"gallery_photo">;
export type GalleryCollection = Tables<"gallery_collection">;

export interface PhotoWithCollection extends GalleryPhoto {
  collections?: Pick<GalleryCollection, "id" | "name">[];
}

export interface CollectionWithPhotoCount extends GalleryCollection {
  photo_count: number;
  cover_photo?: Pick<GalleryPhoto, "id" | "filename" | "blob_url"> | null;
}

interface CollectionPhoto {
  display_order: number | null;
  gallery_photo: GalleryPhoto;
}

// Get all gallery collections for navigation
export async function getGalleryCollections(): Promise<
  CollectionWithPhotoCount[]
> {
  const supabase = createClient();

  try {
    // First get all collections with cover photos
    const { data: collections, error: collectionsError } = await supabase
      .from("gallery_collection")
      .select(
        `
        *,
        cover_photo:gallery_photo!cover_photo_id(
          id,
          filename,
          blob_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (collectionsError) {
      console.error("Error fetching collections:", collectionsError);
      return [];
    }

    if (!collections) return [];

    // Get photo counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const { count } = await supabase
          .from("gallery_photo_collection_link")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", collection.id);

        return {
          ...collection,
          photo_count: count || 0,
        };
      })
    );

    return collectionsWithCounts;
  } catch (error) {
    console.error("Error fetching gallery collections:", error);
    return [];
  }
}

// Get photos for a specific collection
export async function getPhotosByCollection(
  collectionId: string
): Promise<GalleryPhoto[]> {
  const supabase = createClient();

  try {
    const { data: photosData, error } = await supabase
      .from("gallery_photo_collection_link")
      .select(
        `
        display_order,
        gallery_photo(*)
        `
      )
      .eq("collection_id", collectionId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }) as {
        data: CollectionPhoto[] | null;
        error: any;
      };

    console.log(photosData);

    if (error) {
      console.error("Error fetching photos for collection:", error);
      return [];
    }

    const photos: GalleryPhoto[] = (photosData || []).map((item) => item.gallery_photo);

    console.log(photos);

    return photos;
  } catch (error) {
    console.error("Error fetching photos by collection:", error);
    return [];
  }
}

// Get photos from the "Featured" collection specifically
export async function getFeaturedPhotos(): Promise<GalleryPhoto[]> {
  const supabase = createClient();

  try {
    // First find the "Featured" collection
    const { data: collection, error: collectionError } = await supabase
      .from("gallery_collection")
      .select("id")
      .eq("name", "Featured")
      .single();

    if (collectionError || !collection) {
      console.error("Featured photos collection not found:", collectionError);
      return [];
    }

    return await getPhotosByCollection(collection.id);
  } catch (error) {
    console.error("Error fetching featured photos:", error);
    return [];
  }
}

// Get collection by ID
export async function getCollectionById(
  id: string
): Promise<GalleryCollection | null> {
  const supabase = createClient();

  try {
    const { data: collection, error } = await supabase
      .from("gallery_collection")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching collection by ID:", error);
      return null;
    }

    return collection;
  } catch (error) {
    console.error("Error fetching collection by ID:", error);
    return null;
  }
}

// Convert legacy PhotoMetadata to GalleryPhoto format for backwards compatibility
export function convertPhotoMetadataToGalleryPhoto(
  photoMetadata: any
): GalleryPhoto {
  return {
    id: photoMetadata.fileName, // Use filename as fallback ID
    blob_url: photoMetadata.filePath,
    filename: photoMetadata.fileName,
    photo_name: photoMetadata.fileName,
    f_stop: photoMetadata.settings.fStop
      ? parseFloat(photoMetadata.settings.fStop)
      : null,
    iso: photoMetadata.settings.iso
      ? parseInt(photoMetadata.settings.iso)
      : null,
    shutter_speed: photoMetadata.settings.shutterSpeed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
