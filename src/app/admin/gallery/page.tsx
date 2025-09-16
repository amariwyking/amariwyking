'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle } from 'iconoir-react';
import FormLayout from '@/app/components/shared/forms/FormLayout';
import { Tables } from '@/app/types/supabase';

type Collection = Tables<'gallery_collection'> & {
  photo_count?: number;
  cover_photo?: {
    id: string;
    filename: string;
    blob_url: string;
  } | null;
};

export default function GalleryManagementPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/collection?include_photo_counts=true');

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data.collections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FormLayout title="Gallery Management">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground font-kode-mono">Loading collections...</p>
        </div>
      </FormLayout>
    );
  }

  if (error) {
    return (
      <FormLayout title="Gallery Management">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive font-kode-mono mb-4">{error}</p>
            <button
              onClick={fetchCollections}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-work-sans"
            >
              Try Again
            </button>
          </div>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout title="Gallery Management">
      <div className="space-y-6">
        {/* Create Collection Button */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground font-work-sans">
            Manage your photo collections and organize your gallery.
          </p>
          <Link
            href="/admin/gallery/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-work-sans"
          >
            <PlusCircle className="w-4 h-4" />
            Create Collection
          </Link>
        </div>

        {/* Collections Grid or Empty State */}
        {collections.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <PlusCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground font-kode-mono mb-2">
              No Collections Yet
            </h3>
            <p className="text-muted-foreground font-work-sans mb-6">
              Create your first collection to organize your photos.
            </p>
            <Link
              href="/admin/gallery/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-work-sans"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Cover Photo or Placeholder */}
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {collection.cover_photo ? (
                    <Image
                      src={collection.cover_photo.blob_url}
                      alt={`Cover for ${collection.name}`}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      <PlusCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-work-sans">No cover photo</p>
                    </div>
                  )}
                </div>

                {/* Collection Details */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-foreground font-kode-mono mb-2 truncate">
                    {collection.name}
                  </h3>

                  {collection.description && (
                    <p className="text-sm text-muted-foreground font-work-sans mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-kode-mono mb-4">
                    <span>{collection.photo_count || 0} photos</span>
                    <span>
                      {new Date(collection.created_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/gallery/${collection.id}/edit`}
                      className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors text-center font-work-sans"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete collection:', collection.id);
                      }}
                      className="px-3 py-2 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors font-work-sans"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormLayout>
  );
}