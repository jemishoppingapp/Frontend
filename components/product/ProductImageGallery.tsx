'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type GalleryImage = { url: string; alt: string };

/**
 * Product image gallery. Falls back to a single image gracefully when
 * there's only one (no thumbnail strip rendered).
 *
 * Mobile-first: main image is full-width square, thumbnails wrap below.
 * Desktop: thumbnails optionally beside the main image (if 2+ images).
 *
 * Light interaction only — no zoom modal, no Carousel.fade animation.
 * Tap a thumbnail to swap the main image. That's it.
 */
export function ProductImageGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  if (images.length === 0) {
    // Defensive — caller should have filtered. Show a placeholder.
    return (
      <div className="aspect-square w-full bg-surface-muted rounded-lg flex items-center justify-center text-sm text-gray-400">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full bg-surface-muted rounded-lg overflow-hidden">
        <Image
          src={images[active].url}
          alt={images[active].alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                'relative aspect-square rounded-md overflow-hidden border-2 transition-colors',
                idx === active
                  ? 'border-primary'
                  : 'border-transparent hover:border-border'
              )}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={idx === active}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}