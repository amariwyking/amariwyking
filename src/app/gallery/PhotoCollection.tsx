"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { GalleryPhoto } from "../lib/gallery-collections";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { gsap } from "gsap";

export interface PhotoCollectionProps {
  galleryPhotos: GalleryPhoto[];
  isTransitioning?: boolean;
}

export default function PhotoCollection({
  galleryPhotos,
  isTransitioning,
}: PhotoCollectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const photos = galleryPhotos;

  // Reset to first photo when collection changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [photos]);

  const animateToPhoto = (newIndex: number) => {
    if (isAnimating || newIndex === currentIndex) return;

    setIsAnimating(true);
    const container = imageContainerRef.current;

    if (!container) {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
      return;
    }

    // Fade out, change photo, fade in
    gsap.to(container, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        setCurrentIndex(newIndex);
        gsap.to(container, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => setIsAnimating(false)
        });
      }
    });
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    animateToPhoto(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    animateToPhoto(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [photos.length, currentIndex, isAnimating]);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-foreground/60">No photos available</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col"
    >
      {/* Main photo display - takes up most of the space */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          ref={imageContainerRef}
          className="relative w-full max-w-6xl h-full max-h-[calc(100%-120px)] rounded-lg overflow-hidden"
        >
          {isLoading && <div className="absolute inset-0 rounded-lg" />}

          <Image
            key={currentPhoto.id}
            src={currentPhoto.blob_url}
            alt=""
            fill
            className={`object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1400px"
            priority
            onLoadingComplete={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
          />
        </div>
      </div>

      {/* Navigation controls and indicators - fixed at bottom */}
      <div className="flex-shrink-0 pb-4 px-4 sm:px-6 lg:px-8">
        {/* Navigation controls - now visible on all screen sizes */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <button
            onClick={goToPrevious}
            disabled={isAnimating}
            className={`flex items-center justify-center w-12 h-12 transition-colors duration-300 ${
              isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'
            }`}
            aria-label="Previous photo"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60 font-kode-mono">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>

          <button
            onClick={goToNext}
            disabled={isAnimating}
            className={`flex items-center justify-center w-12 h-12 transition-colors duration-300 ${
              isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'
            }`}
            aria-label="Next photo"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
