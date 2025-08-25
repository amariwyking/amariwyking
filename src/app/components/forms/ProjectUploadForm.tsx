'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { TablesInsert } from '@/app/types/database';
import { createProject } from '@/actions/project';
import SkillsInput from './SkillsInput';
import ImageUploadPreview from './ImageUploadPreview';
import { v4 as uuidv4 } from 'uuid';

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
    <div className="upload-form">
      <div className="max-w-7xl p-6 shadow-lg rounded-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload New Project</h1>

        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-md">
            <p className="text-sm text-blue-600">{uploadProgress}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., My Awesome Web App"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y ${errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Provide a detailed description of the project..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="project_end_date" className="block text-sm font-medium text-gray-700 mb-2">
              Project End Date
            </label>
            <input
              type="date"
              id="project_end_date"
              value={formData.project_end_date || ''}
              onChange={(e) => handleInputChange('project_end_date', e.target.value || null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.project_end_date ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.project_end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.project_end_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-2">
              Skills
            </label>
            <SkillsInput
              skills={formData.skills || []}
              onChange={handleSkillsChange}
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Images
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP or GIF (MAX. 5MB each)</p>
                    <p className="text-xs text-gray-500">{images.length}/10 images uploaded</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="mt-2 text-sm text-red-600">{errors.images}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
            >
              {isSubmitting ? (uploadProgress || 'Submitting...') : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}