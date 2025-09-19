"use client";

import { useState, useEffect } from "react";
import PhotoCollection from "./PhotoCollection";
import CollectionDrawer from "../components/gallery/CollectionDrawer";
import Navigation from "../components/shared/Navigation";
import {
  GalleryPhoto,
  CollectionWithPhotoCount,
  getPhotosByCollection,
} from "../lib/gallery-collections";

interface GalleryClientProps {
  initialPhotos: GalleryPhoto[];
  collections: CollectionWithPhotoCount[];
}

export default function GalleryClient({
  initialPhotos,
  collections,
}: GalleryClientProps) {
  const [currentPhotos, setCurrentPhotos] =
    useState<GalleryPhoto[]>(initialPhotos);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Disable vertical scrolling completely
  useEffect(() => {
    // Disable scrolling when component mounts
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100dvh";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleCollectionSelect = async (
    collectionId: string,
    collectionName: string
  ) => {
    if (collectionId === activeCollectionId) return; // Already selected

    setIsTransitioning(true);
    setIsLoading(true);

    try {
      let newPhotos: GalleryPhoto[];

      if (collectionId === "featured") {
        // Featured photos - use initial data
        newPhotos = initialPhotos;
        setActiveCollectionId(null);
      } else {
        // Fetch photos for the selected collection
        newPhotos = await getPhotosByCollection(collectionId);
        setActiveCollectionId(collectionId);
      }

      // Add a slight delay to allow exit animation to complete
      setTimeout(() => {
        setCurrentPhotos(newPhotos);
        setIsTransitioning(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading collection photos:", error);
      setIsTransitioning(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Collection Drawer */}
      <CollectionDrawer
        collections={collections}
        activeCollectionId={activeCollectionId}
        onCollectionSelect={handleCollectionSelect}
      />

      {/* Main Gallery Content */}
      <main className="flex max-h-dvh flex-col overflow-hidden font-work-sans fixed inset-0">
        {/* Loading indicator during transitions */}
        {isLoading && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-foreground">
                  Loading collection...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Header with Collection Info */}
        <div className="h-fit mt-[15%] md:mt-[2.5%]">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-foreground">
              {activeCollectionId
                ? collections.find((c) => c.id === activeCollectionId)?.name ||
                  "Gallery"
                : "Featured"}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <PhotoCollection
            galleryPhotos={currentPhotos}
            isTransitioning={isTransitioning}
          />
        </div>

        {/* Empty state when no photos */}
        {/* {!isLoading && currentPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="max-w-md mx-auto px-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No photos in this collection
              </h3>
              <p className="text-gray-600 mb-6">
                {`This collection doesn't have any photos yet. Check back later or select a different collection.`}
              </p>
              <button
                onClick={() => handleCollectionSelect('featured', 'Featured Photos')}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                View Featured Photos
              </button>
            </div>
          </div>
        )} */}
      </main>
    </>
  );
}
