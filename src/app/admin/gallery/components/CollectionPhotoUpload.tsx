'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { createGalleryPhoto } from '@/actions/gallery';
import ImageUploadPreview from '@/app/components/forms/ImageUploadPreview';
import FileDropZone from '@/app/components/shared/forms/FileDropZone';
import FormActionButton from '@/app/components/shared/forms/FormActionButton';
import FormProgressIndicator from '@/app/components/shared/forms/FormProgressIndicator';
import FormErrorMessage from '@/app/components/shared/forms/FormErrorMessage';
import { v4 as uuidv4 } from 'uuid';
import { Tables } from '@/app/types/supabase';

type Photo = Tables<'gallery_photo'>;

interface PhotoData {
  file: File;
  name: string;
  caption: string;
  id: string;
}

interface PhotoUploadStatus {
  uploading: boolean;
  uploaded: boolean;
  failed: boolean;
  blobUrl?: string;
  error?: string;
}

interface CollectionPhotoUploadProps {
  collectionId: string;
  onPhotosUploaded?: (photos: Photo[]) => void;
  className?: string;
}

export default function CollectionPhotoUpload({
  collectionId,
  onPhotosUploaded,
  className = ''
}: CollectionPhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [photoUploadStatus, setPhotoUploadStatus] = useState<Record<string, PhotoUploadStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: PhotoData[] = Array.from(files).slice(0, 20 - photos.length).map(file => ({
      file,
      name: '',
      caption: '',
      id: uuidv4()
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    setError('');
  };

  const handlePhotoNameChange = (id: string, name: string) => {
    setPhotos(prev => prev.map(photo =>
      photo.id === id ? { ...photo, name } : photo
    ));
  };

  const handlePhotoCaptionChange = (id: string, caption: string) => {
    setPhotos(prev => prev.map(photo =>
      photo.id === id ? { ...photo, caption } : photo
    ));
  };

  const handlePhotoRemove = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    setPhotoUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[id];
      return newStatus;
    });
  };

  const uploadPhotoToBlob = async (photo: PhotoData): Promise<string> => {
    setPhotoUploadStatus(prev => ({
      ...prev,
      [photo.id]: { uploading: true, uploaded: false, failed: false }
    }));

    try {
      const fileExtension = photo.file.name.split('.').pop();
      const photoId = uuidv4();
      const blob = await upload(`gallery-${photoId}.${fileExtension}`, photo.file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setPhotoUploadStatus(prev => ({
        ...prev,
        [photo.id]: { uploading: false, uploaded: true, failed: false, blobUrl: blob.url }
      }));

      return blob.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setPhotoUploadStatus(prev => ({
        ...prev,
        [photo.id]: { uploading: false, uploaded: false, failed: true, error: errorMessage }
      }));
      throw new Error(`Failed to upload ${photo.file.name}: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError('Please select at least one photo to upload');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setUploadProgress('Preparing upload...');

    try {
      // Step 1: Upload all photos to Vercel Blob storage
      setUploadProgress(`Uploading ${photos.length} photo(s)...`);

      const uploadPromises = photos.map(uploadPhotoToBlob);
      const uploadResults = await Promise.allSettled(uploadPromises);

      // Check for any failed uploads
      const failedUploads = uploadResults.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        const failedMessages = failedUploads.map((result, index) =>
          `Photo ${index + 1}: ${result.reason?.message || 'Upload failed'}`
        );
        throw new Error(`Some photos failed to upload:\n${failedMessages.join('\n')}`);
      }

      // Get successful upload URLs
      const photoUrls = uploadResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);

      // Step 2: Create photos in database and add to collection
      setUploadProgress('Saving photos to database...');

      const createdPhotos: Photo[] = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const blobUrl = photoUrls[i];

        const result = await createGalleryPhoto({
          blob_url: blobUrl,
          filename: photo.file.name,
          photo_name: photo.name.trim() || undefined,
          collection_ids: [collectionId]
        });

        if (!result.success) {
          console.error('Failed to create photo:', result.message);
          // Continue with other photos even if one fails
          continue;
        }

        if (result.photo) {
          createdPhotos.push(result.photo);
        }
      }

      setUploadProgress('Upload completed successfully!');

      // Clear the form
      setPhotos([]);
      setPhotoUploadStatus({});

      // Notify parent component
      onPhotosUploaded?.(createdPhotos);

      setTimeout(() => setUploadProgress(''), 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      if (!error) {
        setTimeout(() => setUploadProgress(''), 3000);
      }
    }
  };

  const handleCancel = () => {
    setPhotos([]);
    setPhotoUploadStatus({});
    setError('');
    setUploadProgress('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <FormErrorMessage message={error} />
      )}

      {uploadProgress && (
        <FormProgressIndicator message={uploadProgress} />
      )}

      {/* File Upload Zone */}
      <div className="space-y-4">
        <FileDropZone
          onFileSelect={handlePhotoUpload}
          maxFiles={20}
          currentCount={photos.length}
          fileTypeText="PNG, JPG, WEBP or GIF (MAX. 5MB each)"
          disabled={isSubmitting}
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <ImageUploadPreview
                  image={photo.file}
                  name={photo.name}
                  caption={photo.caption}
                  onNameChange={(name) => handlePhotoNameChange(photo.id, name)}
                  onCaptionChange={(caption) => handlePhotoCaptionChange(photo.id, caption)}
                  onRemove={() => handlePhotoRemove(photo.id)}
                />

                {/* Upload Status Overlay */}
                {photoUploadStatus[photo.id] && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    {photoUploadStatus[photo.id].uploading && (
                      <div className="text-white text-sm font-work-sans">Uploading...</div>
                    )}
                    {photoUploadStatus[photo.id].uploaded && (
                      <div className="text-primary text-sm font-work-sans">✓ Uploaded</div>
                    )}
                    {photoUploadStatus[photo.id].failed && (
                      <div className="text-destructive text-sm font-work-sans">✗ Failed</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {photos.length > 0 && (
        <div className="flex gap-4 pt-4">
          <FormActionButton
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </FormActionButton>

          <FormActionButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting || photos.length === 0}
          >
            {isSubmitting ? 'Uploading...' : `Upload ${photos.length} Photo${photos.length !== 1 ? 's' : ''}`}
          </FormActionButton>
        </div>
      )}
    </div>
  );
}