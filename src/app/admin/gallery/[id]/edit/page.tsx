"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Xmark } from "iconoir-react";
import FormLayout from "@/app/components/shared/forms/FormLayout";
import FormField from "@/app/components/shared/forms/FormField";
import FormErrorMessage from "@/app/components/shared/forms/FormErrorMessage";
import FormProgressIndicator from "@/app/components/shared/forms/FormProgressIndicator";
import SubmitButton from "@/app/components/shared/forms/SubmitButton";
import FormActionButton from "@/app/components/shared/forms/FormActionButton";
import CollectionPhotoUpload from "../../components/CollectionPhotoUpload";
import { Tables } from "@/app/types/supabase";

type Collection = Tables<"gallery_collection"> & {
  cover_photo?: {
    id: string;
    filename: string;
    blob_url: string;
  } | null;
};

type Photo = Tables<"gallery_photo">;

interface CollectionPhoto extends Photo {
  display_order?: number;
}

interface FormData {
  name: string;
  description: string;
  cover_photo_id: string | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  cover_photo_id?: string;
  general?: string;
}

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionPhotos, setCollectionPhotos] = useState<CollectionPhoto[]>(
    []
  );
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    cover_photo_id: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  useEffect(() => {
    fetchCollectionData();
    fetchAvailablePhotos();
  }, [collectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCollectionData = async () => {
    try {
      const response = await fetch(`/api/gallery/collection/${collectionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/gallery");
          return;
        }
        throw new Error("Failed to fetch collection");
      }

      const data = await response.json();
      const coll = data.collection;
      setCollection(coll);
      setFormData({
        name: coll.name,
        description: coll.description || "",
        cover_photo_id: coll.cover_photo_id,
      });

      // Fetch photos in this collection
      const photosResponse = await fetch(
        `/api/gallery/photo?collection_id=${collectionId}`
      );
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setCollectionPhotos(photosData.photos || []);
      }
    } catch (error) {
      setErrors({ general: "Failed to load collection data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePhotos = async () => {
    try {
      const response = await fetch("/api/gallery/photo");
      if (response.ok) {
        const data = await response.json();
        setAvailablePhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Failed to fetch available photos:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Collection name must be at least 3 characters long";
    } else if (formData.name.length > 255) {
      newErrors.name = "Collection name must be less than 255 characters";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setProgress("Updating collection...");
    setErrors({});

    try {
      const response = await fetch(`/api/gallery/collection/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          cover_photo_id: formData.cover_photo_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: "A collection with this name already exists" });
          return;
        }
        throw new Error(result.error || "Failed to update collection");
      }

      setProgress("Collection updated successfully!");
      setCollection(result.collection);

      setTimeout(() => setProgress(""), 2000);
    } catch (error) {
      console.error("Collection update error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    setProgress("Deleting collection...");

    try {
      const response = await fetch(`/api/gallery/collection/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete collection");
      }

      setProgress("Collection deleted successfully!");
      setTimeout(() => {
        router.push("/admin/gallery");
      }, 1000);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to delete collection",
      });
      setProgress("");
    }
    setShowDeleteConfirm(false);
  };

  const removePhotoFromCollection = async (photoId: string) => {
    try {
      const response = await fetch(
        `/api/gallery/photo/${photoId}/collection/${collectionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove photo from collection");
      }

      // Update local state on successful API call
      setCollectionPhotos((prev) =>
        prev.filter((photo) => photo.id !== photoId)
      );

      // If the removed photo was the cover photo, clear it
      if (formData.cover_photo_id === photoId) {
        setFormData((prev) => ({ ...prev, cover_photo_id: null }));
      }
    } catch (error) {
      console.error("Failed to remove photo:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to remove photo from collection",
      });
    }
  };

  const setCoverPhoto = (photoId: string | null) => {
    setFormData((prev) => ({ ...prev, cover_photo_id: photoId }));
  };

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    // Add new photos to the collection photos list
    setCollectionPhotos((prev) => [...prev, ...newPhotos]);
    // Optionally refresh the collection data to get updated counts
    fetchCollectionData();
  };

  if (loading) {
    return (
      <FormLayout title="Edit Collection">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground font-kode-mono">
            Loading collection...
          </p>
        </div>
      </FormLayout>
    );
  }

  if (!collection) {
    return (
      <FormLayout title="Collection Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground font-work-sans mb-4">
            The collection you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-work-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout title={`Edit: ${collection.name}`}>
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-work-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery Management
        </Link>
      </div>

      {errors.general && <FormErrorMessage message={errors.general} />}

      {progress && <FormProgressIndicator message={progress} />}

      <div className="space-y-8">
        {/* Collection Details Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground font-kode-mono mb-6">
            Collection Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Collection Name" required error={errors.name}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
                placeholder="e.g., Wedding Photos, Travel 2024"
                style={{ fontFamily: "var(--font-work-sans)" }}
                maxLength={255}
              />
              <p className="mt-1 text-xs text-muted-foreground font-kode-mono">
                {formData.name.length}/255 characters
              </p>
            </FormField>

            <FormField label="Description" error={errors.description}>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y ${
                  errors.description ? "border-destructive" : "border-border"
                }`}
                placeholder="Optional description of this collection..."
                style={{ fontFamily: "var(--font-work-sans)" }}
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-muted-foreground font-kode-mono">
                {formData.description.length}/1000 characters
              </p>
            </FormField>

            <div className="flex gap-4 pt-4 sm:pt-6">
              <FormActionButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Collection..." : "Update Collection"}
              </FormActionButton>

              <FormActionButton
                variant="destructive"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Collection
              </FormActionButton>
            </div>
          </form>
        </div>

        {/* Photos in Collection */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground font-kode-mono">
              Photos ({collectionPhotos.length})
            </h2>
            <FormActionButton
              variant="primary"
              size="md"
              onClick={() => setShowPhotoSelector(true)}
            >
              {/* <Plus className="w-4 h-4 mr-2" /> */}
              Add Photos
            </FormActionButton>
          </div>

          {collectionPhotos.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-work-sans">
                No photos in this collection yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collectionPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
                >
                  <Image
                    src={photo.blob_url}
                    alt={photo.photo_name || photo.filename}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCoverPhoto(photo.id)}
                      className={`px-2 py-1 text-xs rounded font-work-sans ${
                        formData.cover_photo_id === photo.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {formData.cover_photo_id === photo.id
                        ? "Cover"
                        : "Set Cover"}
                    </button>
                    <button
                      onClick={() => removePhotoFromCollection(photo.id)}
                      className="p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                    >
                      <Xmark className="w-4 h-4" />
                    </button>
                  </div>

                  {formData.cover_photo_id === photo.id && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-work-sans">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload New Photos */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground font-kode-mono mb-6">
            Upload New Photos
          </h2>
          <p className="text-sm text-muted-foreground font-work-sans mb-4">
            Upload photos directly to this collection. Photos will be added to the gallery and automatically included in this collection.
          </p>
          <CollectionPhotoUpload
            collectionId={collectionId}
            onPhotosUploaded={handlePhotosUploaded}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-foreground font-kode-mono mb-4">
              Delete Collection
            </h3>
            <p className="text-muted-foreground font-work-sans mb-6">
              Are you sure you want to delete &quot;{collection.name}&quot;?
              This action cannot be undone. Photos will not be deleted, only the
              collection.
            </p>
            <div className="flex gap-4">
              <FormActionButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </FormActionButton>
              <FormActionButton
                variant="destructive"
                size="md"
                fullWidth
                onClick={handleDeleteCollection}
              >
                Delete
              </FormActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Photo Selector Modal (Placeholder) */}
      {showPhotoSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-4xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground font-kode-mono">
                Add Photos to Collection
              </h3>
              <FormActionButton
                variant="secondary"
                size="sm"
                onClick={() => setShowPhotoSelector(false)}
                className="p-2"
              >
                <Xmark className="w-5 h-5" />
              </FormActionButton>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-auto">
              {availablePhotos
                .filter(
                  (photo) => !collectionPhotos.find((cp) => cp.id === photo.id)
                )
                .map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => {
                      // TODO: Implement add photo to collection
                      setCollectionPhotos((prev) => [...prev, photo]);
                      console.log("Add photo to collection:", photo.id);
                    }}
                  >
                    <Image
                      src={photo.blob_url}
                      alt={photo.photo_name || photo.filename}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>

            {availablePhotos.filter(
              (photo) => !collectionPhotos.find((cp) => cp.id === photo.id)
            ).length === 0 && (
              <p className="text-center text-muted-foreground font-work-sans py-8">
                All available photos are already in this collection.
              </p>
            )}
          </div>
        </div>
      )}
    </FormLayout>
  );
}
