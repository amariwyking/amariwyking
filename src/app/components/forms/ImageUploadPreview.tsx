import { useState, useEffect } from 'react';

interface ImageUploadPreviewProps {
  image: File;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onRemove: () => void;
}

export default function ImageUploadPreview({
  image,
  caption,
  onCaptionChange,
  onRemove
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;

    if (image.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(image.type)) {
      setError('File must be JPEG, PNG, WEBP, or GIF');
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-red-800">{image.name}</p>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 focus:outline-none"
            aria-label="Remove image"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
            {image.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(image.size)} • {image.type}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Remove image"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {previewUrl && (
        <div className="mb-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-md border border-gray-200"
          />
        </div>
      )}

      <div>
        <label htmlFor={`caption-${image.name}`} className="block text-sm font-medium text-gray-700 mb-1">
          Caption
        </label>
        <input
          type="text"
          id={`caption-${image.name}`}
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Add a caption for this image..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          maxLength={255}
        />
        <p className="text-xs text-gray-500 mt-1">
          {caption.length}/255 characters
        </p>
      </div>
    </div>
  );
}