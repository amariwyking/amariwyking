'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormLayout from '@/app/components/shared/forms/FormLayout';
import FormField from '@/app/components/shared/forms/FormField';
import FormErrorMessage from '@/app/components/shared/forms/FormErrorMessage';
import FormProgressIndicator from '@/app/components/shared/forms/FormProgressIndicator';
import SubmitButton from '@/app/components/shared/forms/SubmitButton';

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

export default function CreateCollectionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Collection name must be at least 3 characters long';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Collection name must be less than 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setProgress('Creating collection...');
    setErrors({});

    try {
      const response = await fetch('/api/gallery/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: 'A collection with this name already exists' });
          return;
        }
        throw new Error(result.error || 'Failed to create collection');
      }

      setProgress('Collection created successfully!');

      // Redirect to the edit page for the new collection
      setTimeout(() => {
        router.push(`/admin/gallery/${result.collection.id}/edit`);
      }, 1000);

    } catch (error) {
      console.error('Collection creation error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
      if (!errors.general) {
        setTimeout(() => setProgress(''), 2000);
      }
    }
  };

  return (
    <FormLayout title="Create New Collection">
      {errors.general && (
        <FormErrorMessage message={errors.general} />
      )}

      {progress && (
        <FormProgressIndicator message={progress} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Collection Name" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input ${
              errors.name ? 'border-destructive' : 'border-border'
            }`}
            placeholder="e.g., Wedding Photos, Travel 2024"
            style={{ fontFamily: 'var(--font-work-sans)' }}
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
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y ${
              errors.description ? 'border-destructive' : 'border-border'
            }`}
            placeholder="Optional description of this collection..."
            style={{ fontFamily: 'var(--font-work-sans)' }}
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-muted-foreground font-kode-mono">
            {formData.description.length}/1000 characters
          </p>
        </FormField>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-sm border border-border rounded-md text-foreground bg-background hover:bg-muted transition-colors font-work-sans"
          >
            Cancel
          </button>

          <SubmitButton
            isSubmitting={isSubmitting}
            loadingText="Creating Collection..."
            submitText="Create Collection"
          />
        </div>
      </form>
    </FormLayout>
  );
}