import React, { useState } from "react";
import { CloudUpload } from "iconoir-react";

interface FileDropZoneProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop?: (files: FileList) => void; // New prop for drag & drop
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  currentCount?: number;
  fileTypeText?: string;
  disabled?: boolean;
  className?: string;
}

export default function FileDropZone({
  onFileSelect,
  onFileDrop,
  accept = "image/*",
  multiple = true,
  maxFiles,
  currentCount = 0,
  fileTypeText = "PNG, JPG, WEBP or GIF",
  disabled = false,
  className = "",
}: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const isAtMaxFiles =
    maxFiles !== undefined ? currentCount >= maxFiles : undefined;
  const isDisabled = disabled || isAtMaxFiles;

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag inactive if leaving the entire drop zone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isDisabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // If onFileDrop is provided, use it; otherwise create a synthetic event for onFileSelect
      if (onFileDrop) {
        onFileDrop(files);
      } else {
        // Create a synthetic event to maintain compatibility with existing onFileSelect
        const syntheticEvent = {
          target: { files },
          currentTarget: { files },
        } as React.ChangeEvent<HTMLInputElement>;
        onFileSelect(syntheticEvent);
      }
    }
  };

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed rounded-lg transition-colors ${
          isDisabled
            ? "cursor-not-allowed opacity-50 border-border"
            : isDragActive
              ? "cursor-pointer bg-muted/60 border-primary"
              : "cursor-pointer bg-muted hover:bg-muted/80 border-border"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground pointer-events-none">
          <CloudUpload className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4" />
          <p className="mb-2 text-sm sm:text-base text-muted-foreground text-center px-2 font-work-sans">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground text-center px-2 font-kode-mono">
            {fileTypeText}
          </p>
          {maxFiles && (
            <p className="text-xs sm:text-sm text-muted-foreground font-kode-mono">
              {currentCount}/{maxFiles} files uploaded
            </p>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={onFileSelect}
          className="hidden"
          disabled={isDisabled}
        />
      </label>
    </div>
  );
}
