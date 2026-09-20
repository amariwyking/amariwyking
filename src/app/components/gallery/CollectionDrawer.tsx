"use client";

import { useState, useEffect, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import type { GalleryCollection } from "@/sanity/lib/fetch";

interface CollectionDrawerProps {
  collections: GalleryCollection[];
  activeCollectionId: string | null;
  onCollectionSelect(collectionId: string): void;
  className?: string;
}

export default function CollectionDrawer({
  collections,
  activeCollectionId,
  onCollectionSelect,
  className = "",
}: CollectionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close drawer when clicking outside or on mobile navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (buttonRef.current) {
      if (!isOpen) {
        // Opening: spin 5 times (1800°) then end at 45° (total 1845°)
        gsap.to(buttonRef.current, {
          rotation: 180 + 45,
          duration: 0.6,
          ease: "power2.out",
        });
      } else {
        // Closing: return to 0°
        gsap.to(buttonRef.current, {
          rotation: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    }
    setIsOpen(!isOpen);
  };

  const handleCollectionClick = (collection: GalleryCollection) => {
    onCollectionSelect(collection._id);
    handleToggle(); // Use toggle function instead of direct setIsOpen
  };

  const getActiveCollectionName = () => {
    if (!activeCollectionId) return "Featured";
    const activeCollection = collections.find(
      (c) => c._id === activeCollectionId
    );
    return activeCollection?.name || "Featured";
  };

  return (
    <>
      {/* Mobile Drawer Toggle Button */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center px-3 py-2"
          aria-label={isOpen ? "Close collection menu" : "Open collection menu"}
        >
          <PlusIcon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-run stroke-foreground" />
        </button>
      </div>

      {/* Full Page Overlay */}
      <div
        className={`fixed inset-0 bg-background/95 backdrop-blur-md z-40 transition-opacity duration-300 font-work-sans ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleToggle}
      >
        {/* Centered Collections List */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full px-8 space-y-6">
            {/* Featured Collection */}
            <button
              onClick={() => {
                onCollectionSelect("featured");
                handleToggle();
              }}
              className="w-full text-center py-4 transition-all duration-200 group"
            >
              <div
                className={`text-2xl md:text-4xl font-medium text-foreground ${
                  activeCollectionId === null
                    ? "underline decoration-2 decoration-primary underline-offset-8"
                    : "hover:text-primary duration-250"
                }`}
              >
                Featured
              </div>
            </button>

            {/* Collections */}
            {collections.filter((c) => c.slug !== "featured").length > 0 && (
              <>
                {collections
                  .filter((c) => c.slug !== "featured")
                  .map((collection) => (
                    <button
                      key={collection._id}
                      onClick={() => handleCollectionClick(collection)}
                      className="w-full text-center py-4 transition-all duration-200 group"
                    >
                      <div
                        className={`text-2xl md:text-4xl font-medium text-foreground ${
                          activeCollectionId === collection._id
                            ? "underline decoration-2 decoration-primary underline-offset-8"
                            : "hover:text-primary duration-250"
                        }`}
                      >
                        {collection.name}
                      </div>
                    </button>
                  ))}
              </>
            )}

            {collections.filter((c) => c.slug !== "featured").length === 0 && (
              <div className="text-center py-8 text-foreground/60">
                <p className="text-lg">No additional collections available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
