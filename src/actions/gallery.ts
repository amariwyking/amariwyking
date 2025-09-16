"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { Tables, TablesInsert } from "@/app/types/supabase";

interface GalleryPhotoData {
  blob_url: string;
  filename?: string;
  collection_ids?: string[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface CreatePhotoResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  photo?: Tables<"gallery_photo">;
}

interface CreateCollectionResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  collection?: Tables<"gallery_collection">;
}

type CollectionData = Omit<
  TablesInsert<"gallery_collection">,
  "id" | "created_at" | "updated_at"
>;

// Server action for creating a gallery photo
export const createGalleryPhoto = async (
  photoData: GalleryPhotoData
): Promise<CreatePhotoResponse> => {
  try {
    await requireAdminAuth();
    console.log("Gallery upload approved for admin.");
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
        errors: [{ field: "auth", message: error.message }],
      };
    }
    return {
      success: false,
      message: "Authentication error occurred",
      errors: [{ field: "auth", message: "Authentication failed" }],
    };
  }

  // Validate input data
  const errors: ValidationError[] = [];

  if (!photoData.blob_url || typeof photoData.blob_url !== "string") {
    errors.push({
      field: "blob_url",
      message: "Blob URL is required and must be a valid string",
    });
  } else {
    try {
      const urlObj = new URL(photoData.blob_url);
      if (!urlObj.hostname.includes("blob.vercel-storage.com")) {
        errors.push({
          field: "blob_url",
          message: "Invalid blob URL - must be from Vercel Blob storage",
        });
      }
    } catch {
      errors.push({
        field: "blob_url",
        message: "Invalid blob URL format",
      });
    }
  }

  if (photoData.filename && photoData.filename.length > 255) {
    errors.push({
      field: "filename",
      message: "Filename must be 255 characters or less",
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  try {
    // Call API logic directly to avoid middleware issues
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const exifr = await import("exifr");

    // Extract EXIF data from the blob URL
    let photoDbData: any = {
      filename:
        photoData.filename || photoData.blob_url.split("/").pop() || "unknown",
      blob_url: photoData.blob_url,
    };

    try {
      // Fetch the image from Vercel Blob to extract EXIF
      const response = await fetch(photoData.blob_url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse EXIF data
        const exif = await exifr.parse(buffer, {
          pick: [
            "FNumber",
            "ISO",
            "ExposureTime",
            "Model",
            "LensModel",
            "FocalLength",
          ],
        });

        // Format shutter speed
        const formatShutterSpeed = (exposureTime: number): string => {
          if (exposureTime >= 1) {
            return `${exposureTime.toFixed(1)}s`;
          } else {
            const fraction = Math.round(1 / exposureTime);
            return `1/${fraction}`;
          }
        };

        // Add EXIF data to photo data
        photoDbData = {
          ...photoDbData,
          f_stop: exif?.FNumber || null,
          iso: exif?.ISO || null,
          shutter_speed: exif?.ExposureTime
            ? formatShutterSpeed(exif.ExposureTime)
            : null,
        };
      }
    } catch (exifError) {
      console.warn("Could not extract EXIF data:", exifError);
      // Continue without EXIF data - not a blocking error
    }

    // Save to database
    const supabase = await createAdminClient();
    const { data: insertedPhoto, error: dbError } = await supabase
      .from("gallery_photo")
      .insert([photoDbData])
      .select()
      .single();

    if (dbError) {
      console.error("Error saving photo to database:", dbError);
      return {
        success: false,
        message: "Failed to save photo to database",
      };
    }

    // Handle collection assignments if provided
    if (photoData.collection_ids && photoData.collection_ids.length > 0) {
      const linkRecords = photoData.collection_ids.map((collectionId) => ({
        photo_id: insertedPhoto.id,
        collection_id: collectionId,
        display_order: 0, // Default order, can be updated later
      }));

      const { error: linkError } = await supabase
        .from("gallery_photo_collection_link")
        .insert(linkRecords);

      if (linkError) {
        console.error("Error linking photo to collections:", linkError);
        // Don't fail the entire operation for link errors
      }
    }

    const result = {
      message: "Photo created successfully",
      photo: insertedPhoto,
    };

    // Revalidate relevant paths
    revalidatePath("/gallery");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Photo created successfully!",
      photo: result.photo,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating the photo",
    };
  }
};

// Server action to fetch gallery photos (for server components)
export const getGalleryPhotos = async (params?: {
  collection_id?: string;
  limit?: number;
  offset?: number;
}): Promise<Tables<"gallery_photo">[]> => {
  try {
    await requireAdminAuth();
  } catch (error) {
    throw new Error("Unauthorized access");
  }

  try {
    const searchParams = new URLSearchParams();
    if (params?.collection_id)
      searchParams.set("collection_id", params.collection_id);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const response = await fetch(
      `http://localhost:3000/api/gallery/photo?${searchParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch photos");
    }

    const result = await response.json();
    return result.photos;
  } catch (error) {
    console.error("Error fetching gallery photos:", error);
    throw new Error("Failed to fetch gallery photos");
  }
};

// // Server action for creating a gallery collection
// export const createGalleryCollection = async (
//   collectionData: CollectionData
// ): Promise<CreateCollectionResponse> => {
//   try {
//     await requireAdminAuth();
//   } catch (error) {
//     if (error instanceof AuthenticationError) {
//       return {
//         success: false,
//         message: "Unauthorized: Admin access required",
//         errors: [{ field: "auth", message: error.message }],
//       };
//     }
//     return {
//       success: false,
//       message: "Authentication error occurred",
//       errors: [{ field: "auth", message: "Authentication failed" }],
//     };
//   }

//   // Validate input data
//   const errors: ValidationError[] = [];

//   const name = collectionData.name?.trim();
//   if (!name) {
//     errors.push({ field: "name", message: "Collection name is required" });
//   } else if (name.length > 255) {
//     errors.push({
//       field: "name",
//       message: "Collection name must be 255 characters or less",
//     });
//   }

//   if (collectionData.description && collectionData.description.length > 1000) {
//     errors.push({
//       field: "description",
//       message: "Description must be 1000 characters or less",
//     });
//   }

//   if (errors.length > 0) {
//     return {
//       success: false,
//       message: "Validation failed",
//       errors,
//     };
//   }

//   try {
//     // Call internal API route
//     const response = await fetch(
//       `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/gallery/collection`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: name,
//           description: collectionData.description?.trim() || null,
//           cover_photo_id: collectionData.cover_photo_id || null,
//         }),
//       }
//     );

//     const result = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         message: result.error || "Failed to create collection",
//       };
//     }

//     // Revalidate relevant paths
//     revalidatePath("/gallery");
//     revalidatePath("/admin");

//     return {
//       success: true,
//       message: "Collection created successfully!",
//       collection: result.collection,
//     };
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return {
//       success: false,
//       message: "An unexpected error occurred while creating the collection",
//     };
//   }
// };

// // Server action to fetch gallery collections (for server components)
// export const getGalleryCollections = async (
//   includeCounts: boolean = false
// ): Promise<Tables<"gallery_collection">[]> => {
//   try {
//     await requireAdminAuth();
//   } catch (error) {
//     throw new Error("Unauthorized access");
//   }

//   try {
//     const searchParams = new URLSearchParams();
//     if (includeCounts) searchParams.set("include_photo_counts", "true");

//     const response = await fetch(
//       `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/gallery/collection?${searchParams}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch collections");
//     }

//     const result = await response.json();
//     return result.collections;
//   } catch (error) {
//     console.error("Error fetching gallery collections:", error);
//     throw new Error("Failed to fetch gallery collections");
//   }
// };
