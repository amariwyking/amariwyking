'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { TablesInsert } from '@/app/types/database';
import { createProject } from '@/actions/project';
import SkillsInput from './SkillsInput';
import ImageUploadPreview from './ImageUploadPreview';
import FormLayout from '../shared/forms/FormLayout';
import FormField from '../shared/forms/FormField';
import FormErrorMessage from '../shared/forms/FormErrorMessage';
import FormProgressIndicator from '../shared/forms/FormProgressIndicator';
import FileDropZone from '../shared/forms/FileDropZone';
import SubmitButton from '../shared/forms/SubmitButton';
import { v4 as uuidv4 } from 'uuid';

interface ImageData {
  file: File;
  caption: string;
  name: string;
  id: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  project_end_date?: string;
  skills?: string;
  images?: string;
  general?: string;
}

interface ImageUploadStatus {
  uploading: boolean;
  uploaded: boolean;
  failed: boolean;
  blobUrl?: string;
  error?: string;
}

export default function ProjectUploadForm() {
  const [formData, setFormData] = useState<TablesInsert<'project'>>({
    title: '',
    description: '',
    project_end_date: null,
    skills: []
  });

  const [images, setImages] = useState<ImageData[]>([]);
  const [imageUploadStatus, setImageUploadStatus] = useState<Record<string, ImageUploadStatus>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TablesInsert<'project'>, value: string | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSkillsChange = (skills: string[]) => {
    handleInputChange('skills', skills);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageData[] = Array.from(files).slice(0, 10 - images.length).map(file => ({
      file,
      caption: '',
      name: '',
      id: uuidv4()
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageCaptionChange = (id: string, caption: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, caption } : img
    ));
  };

  const handleImageNameChange = (id: string, name: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, name } : img
    ));
  };

  const handleImageRemove = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const uploadImageToBlob = async (image: ImageData): Promise<string> => {
    setImageUploadStatus(prev => ({
      ...prev,
      [image.id]: { uploading: true, uploaded: false, failed: false }
    }));

    try {
      const fileExtension = image.file.name.split('.').pop();
      const blob = await upload(`${image.id}.${fileExtension}`, image.file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setImageUploadStatus(prev => ({
        ...prev,
        [image.id]: { uploading: false, uploaded: true, failed: false, blobUrl: blob.url }
      }));

      return blob.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setImageUploadStatus(prev => ({
        ...prev,
        [image.id]: { uploading: false, uploaded: false, failed: true, error: errorMessage }
      }));
      throw new Error(`Failed to upload ${image.file.name}: ${errorMessage}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setUploadProgress('Preparing submission...');

    try {
      // Step 1: Upload all images to Vercel Blob storage first
      let imageData: Array<{ id: string; caption: string | null; blobUrl: string }> = [];

      if (images.length > 0) {
        setUploadProgress(`Uploading ${images.length} image(s)...`);

        const uploadPromises = images.map(uploadImageToBlob);
        const uploadResults = await Promise.allSettled(uploadPromises);

        // Check for any failed uploads
        const failedUploads = uploadResults.filter(result => result.status === 'rejected');
        if (failedUploads.length > 0) {
          const failedMessages = failedUploads.map((result, index) =>
            `Image ${index + 1}: ${result.reason?.message || 'Upload failed'}`
          );
          throw new Error(`Some images failed to upload:\n${failedMessages.join('\n')}`);
        }

        // Get successful upload URLs
        const imageUrls = uploadResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<string>).value);

        // Combine image data with blob URLs
        imageData = images.map((image, index) => ({
          id: image.id,
          caption: image.caption || null,
          blobUrl: imageUrls[index]
        }));
      }

      // Step 2: Create project with complete data including blob URLs
      setUploadProgress('Creating project...');

      const projectData = {
        title: formData.title,
        description: formData.description,
        project_end_date: formData.project_end_date || null,
        skills: formData.skills || [],
        imageData: imageData
      };

      const result = await createProject(projectData);

      if (!result.success) {
        if (result.errors) {
          const newErrors: FormErrors = {};
          result.errors.forEach(error => {
            newErrors[error.field as keyof FormErrors] = error.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: result.message });
        }
        return;
      }

      // Success - clear form and show success message
      setFormData({
        title: '',
        description: '',
        project_end_date: null,
        skills: []
      });
      setImages([]);
      setImageUploadStatus({});
      setUploadProgress('');
      alert('Project created successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <FormLayout title="Upload New Project">
      {errors.general && (
        <FormErrorMessage message={errors.general} />
      )}

      {uploadProgress && (
        <FormProgressIndicator message={uploadProgress} />
      )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 min-w-0">
          <FormField label="Project Title" required error={errors.title}>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full max-w-full min-w-0 px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input ${errors.title ? 'border-destructive' : 'border-border'
                }`}
              placeholder="e.g., My Awesome Web App"
              style={{ fontFamily: 'var(--font-work-sans)' }}
            />
          </FormField>

          <FormField label="Project Description" required error={errors.description}>
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full max-w-full min-w-0 px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y ${errors.description ? 'border-destructive' : 'border-border'
                }`}
              placeholder="Provide a detailed description of the project..."
              style={{ fontFamily: 'var(--font-work-sans)' }}
            />
          </FormField>

          <FormField label="Project End Date" error={errors.project_end_date}>
            <input
              type="date"
              id="project_end_date"
              value={formData.project_end_date || ''}
              onChange={(e) => handleInputChange('project_end_date', e.target.value || null)}
              className={`w-full max-w-1/2 min-w-0 px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-foreground [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.project_end_date ? 'border-destructive' : 'border-border'
                }`}
              style={{ colorScheme: 'light dark' }}
            />
          </FormField>

          <FormField label="Skills" error={errors.skills}>
            <SkillsInput
              skills={formData.skills || []}
              onChange={handleSkillsChange}
            />
          </FormField>

          <FormField label="Project Images" error={errors.images}>
            <div className="space-y-4">
              <FileDropZone
                onFileSelect={handleImageUpload}
                maxFiles={10}
                currentCount={images.length}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {images.map((image) => (
                    <ImageUploadPreview
                      key={image.id}
                      image={image.file}
                      name={image.name}
                      caption={image.caption}
                      onNameChange={(name) => handleImageNameChange(image.id, name)}
                      onCaptionChange={(caption) => handleImageCaptionChange(image.id, caption)}
                      onRemove={() => handleImageRemove(image.id)}
                    />
                  ))}
                </div>
              )}

            </div>
          </FormField>

          <SubmitButton
            isSubmitting={isSubmitting}
            loadingText={uploadProgress || 'Submitting...'}
            submitText="Submit Project"
          />
        </form>
    </FormLayout>
  );
}