import { CloudUpload } from 'iconoir-react';

interface FileDropZoneProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  accept = "image/*",
  multiple = true,
  maxFiles,
  currentCount = 0,
  fileTypeText = "PNG, JPG, WEBP or GIF (MAX. 5MB each)",
  disabled = false,
  className = ""
}: FileDropZoneProps) {
  const isAtMaxFiles = maxFiles && currentCount >= maxFiles;
  const isDisabled = disabled || isAtMaxFiles;

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-border border-dashed rounded-lg transition-colors ${
          isDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer bg-muted hover:bg-muted/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
          <CloudUpload className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4"/>
          <p className="mb-2 text-sm sm:text-base text-muted-foreground text-center px-2 font-work-sans">
            <span className="font-semibold">Click to upload</span> or drag and drop
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