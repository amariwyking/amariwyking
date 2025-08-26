'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { TablesInsert } from '@/app/types/database';
import { createProject } from '@/actions/project';
import SkillsInput from './SkillsInput';
import ImageUploadPreview from './ImageUploadPreview';
import { v4 as uuidv4 } from 'uuid';
import { CloudUpload } from 'iconoir-react';

interface ImageData {
  file: File;
  caption: string;
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
      id: uuidv4()
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageCaptionChange = (id: string, caption: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, caption } : img
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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 overflow-hidden">
      <div className="w-full max-w-4xl mx-auto min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 sm:mb-8 font-kode-mono">Upload New Project</h1>

        {errors.general && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm sm:text-base text-destructive font-kode-mono">{errors.general}</p>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-sm sm:text-base text-primary font-kode-mono">{uploadProgress}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 min-w-0">
          <div className="min-w-0">
            <label htmlFor="title" className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
              Project Title *
            </label>
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
            {errors.title && (
              <p className="mt-1 text-sm sm:text-base text-destructive font-kode-mono">{errors.title}</p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="description" className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
              Project Description *
            </label>
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
            {errors.description && (
              <p className="mt-1 text-sm sm:text-base text-destructive font-kode-mono">{errors.description}</p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="project_end_date" className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
              Project End Date
            </label>
            <input
              type="date"
              id="project_end_date"
              value={formData.project_end_date || ''}
              onChange={(e) => handleInputChange('project_end_date', e.target.value || null)}
              className={`w-full max-w-1/2 min-w-0 px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-foreground [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.project_end_date ? 'border-destructive' : 'border-border'
                }`}
              style={{ colorScheme: 'light dark' }}
            />
            {errors.project_end_date && (
              <p className="mt-1 text-sm sm:text-base text-destructive font-kode-mono">{errors.project_end_date}</p>
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
              Skills
            </label>
            <div className="min-w-0">
              <SkillsInput
                skills={formData.skills || []}
                onChange={handleSkillsChange}
              />
            </div>
            {errors.skills && (
              <p className="mt-1 text-sm sm:text-base text-destructive font-kode-mono">{errors.skills}</p>
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
              Project Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                    <CloudUpload className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4"/>
                    <p className="mb-2 text-sm sm:text-base text-muted-foreground text-center px-2 font-work-sans">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground text-center px-2 font-kode-mono">PNG, JPG, WEBP or GIF (MAX. 5MB each)</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-kode-mono">{images.length}/10 images uploaded</p>
                  </div>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 10}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {images.map((image) => (
                    <ImageUploadPreview
                      key={image.id}
                      image={image.file}
                      caption={image.caption}
                      onCaptionChange={(caption) => handleImageCaptionChange(image.id, caption)}
                      onRemove={() => handleImageRemove(image.id)}
                    />
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="mt-2 text-sm sm:text-base text-destructive font-kode-mono">{errors.images}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-2 text-sm sm:text-base rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors ${isSubmitting
                  ? 'bg-muted cursor-not-allowed text-muted-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
            >
              <span className="font-work-sans">{isSubmitting ? (uploadProgress || 'Submitting...') : 'Submit Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}