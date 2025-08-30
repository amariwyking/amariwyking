"use client";

import { ProjectDetailsProps } from '@/app/types/project-showcase';

export default function ProjectDetails({
  description,
  isExpanded,
  wordLimit = 30
}: ProjectDetailsProps) {

  // Split description into words
  const words = description.split(' ');
  const previewText = words.slice(0, wordLimit).join(' ');
  const shouldTruncate = words.length > wordLimit;

  return (
    <div className="project-details-content">
      {/* Preview text (truncated) */}
      {!isExpanded && (
        <p className="font-work-sans text-base text-card-foreground leading-relaxed">
          {previewText}
          {shouldTruncate && (
            <>
              <span className="text-muted-foreground">...</span>
            </>
          )}
        </p>
      )}

      {/* Full text */}
      {isExpanded && (
        <div className="full-description">
          <p className="font-work-sans text-base text-card-foreground leading-relaxed mb-4">
            {description}
          </p>
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}