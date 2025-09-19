import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploadPreviewProps {
  image: File;
  name: string;
  caption: string;
  onNameChange: (name: string) => void;
  onCaptionChange: (caption: string) => void;
  onRemove: () => void;
}

export default function ImageUploadPreview({
  image,
  name,
  caption,
  onNameChange,
  onCaptionChange,
  onRemove,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;

    if (image.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        image.type
      )
    ) {
      setError("File must be JPEG, PNG, WEBP, or GIF");
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
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-destructive">{image.name}</p>
          <button
            type="button"
            onClick={onRemove}
            className="text-destructive"
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
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 overflow-hidden">
          <p
            className="text-sm max-w-2/3 font-medium text-card-foreground truncate"
            title={image.name}
          >
            {image.name}
          </p>
          <p className="text-xs text-card-foreground">
            {formatFileSize(image.size)} • {image.type}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-card-foreground hover:text-destructive focus:outline-none transition-all"
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
          <Image
            src={previewUrl}
            alt="Preview"
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-md border border-border"
            unoptimized
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`name-${image.name}`}
            className="block text-sm font-medium text-card-foreground mb-1"
          >
            Photo Name
          </label>
          <input
            type="text"
            id={`name-${image.name}`}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter a name for this photo (optional)"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-primary text-sm"
            maxLength={255}
          />
          <p className="text-xs text-card-foreground mt-1">
            {name.length}/255 characters
          </p>
        </div>

        <div>
          <label
            htmlFor={`caption-${image.name}`}
            className="block text-sm font-medium text-card-foreground mb-1"
          >
            Caption
          </label>
          <input
            type="text"
            id={`caption-${image.name}`}
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Add a caption for this image..."
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-primary text-sm"
            maxLength={255}
          />
          <p className="text-xs text-card-foreground mt-1">
            {caption.length}/255 characters
          </p>
        </div>
      </div>
    </div>
  );
}
