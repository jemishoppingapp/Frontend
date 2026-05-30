'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  url: string;
  publicId: string;
  alt: string;
}

interface CloudinaryUploaderProps {
  images: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  productName?: string;
  maxImages?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;
const UPLOAD_PRESET = 'jemi_products';

export function CloudinaryUploader({
  images,
  onChange,
  productName,
  maxImages = 5,
}: CloudinaryUploaderProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = maxImages - images.length;

  const uploadSingleFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    if (!cloudName) {
      toast.error('Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.');
      return null;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`"${file.name}" is not a supported format. Use JPG, PNG, or WebP.`);
      return null;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB} MB.`);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.error?.message || `Upload failed (${res.status})`;
        toast.error(`Could not upload "${file.name}": ${msg}`);
        return null;
      }
      const data = await res.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        alt: productName || file.name.replace(/\.[^.]+$/, ''),
      };
    } catch (err) {
      toast.error(`Could not upload "${file.name}". Check your connection.`);
      // eslint-disable-next-line no-console
      console.error('[CloudinaryUploader] upload failed:', err);
      return null;
    }
  }, [cloudName, productName]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    if (remaining <= 0) {
      toast.error(`You can only have ${maxImages} images. Remove one to upload another.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) {
      toast.warning(`Only uploading ${toUpload.length} of ${files.length} files (max ${maxImages} total).`);
    }

    setUploadingCount(toUpload.length);
    const results = await Promise.all(toUpload.map(uploadSingleFile));
    const successful = results.filter((r): r is UploadedImage => r !== null);
    if (successful.length > 0) {
      onChange([...images, ...successful]);
    }
    setUploadingCount(0);
  }, [images, onChange, remaining, maxImages, uploadSingleFile]);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    void handleFiles(files);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    void handleFiles(files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  }

  const canAddMore = remaining > 0 && uploadingCount === 0;

  return (
    <div>
      {!cloudName && (
        <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-start gap-2 text-xs text-fg-1">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-fg">Cloudinary not configured</p>
            <p className="text-fg-2 mt-0.5">
              Set <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> in <code>.env.local</code> and restart dev.
            </p>
          </div>
        </div>
      )}

      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((img, idx) => (
            <div key={`${img.publicId}-${idx}`} className="relative group bg-surface-1 rounded-lg overflow-hidden border border-border-soft">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Cover
                  </div>
                )}
              </div>
              <div className="p-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className="text-[11px] px-1.5 h-6 rounded bg-surface border border-border text-fg-2 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move left"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="text-[11px] px-1.5 h-6 rounded bg-surface border border-border text-fg-2 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move right"
                    title="Move right"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-[11px] inline-flex items-center gap-1 px-2 h-6 rounded bg-surface border border-border text-danger hover:bg-danger/5"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary-soft/30'
              : 'border-border bg-surface-1 hover:bg-surface-2'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleFileInputChange}
            className="sr-only"
            id="cloudinary-upload-input"
          />
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-surface mb-3">
            <Upload className="h-5 w-5 text-fg-2" />
          </div>
          <p className="text-sm font-medium text-fg mb-1">
            Drag images here or{' '}
            <label htmlFor="cloudinary-upload-input" className="text-primary cursor-pointer hover:underline">
              browse
            </label>
          </p>
          <p className="text-xs text-fg-2">
            JPG, PNG, or WebP — up to {MAX_FILE_SIZE_MB}MB each. {remaining} of {maxImages} slot{remaining === 1 ? '' : 's'} left.
          </p>
        </div>
      )}

      {/* Uploading state */}
      {uploadingCount > 0 && (
        <div className="rounded-xl border border-border-soft bg-surface-1 p-6 text-center">
          <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm text-fg-2">Uploading {uploadingCount} image{uploadingCount === 1 ? '' : 's'}…</p>
        </div>
      )}

      {/* Max reached state */}
      {!canAddMore && uploadingCount === 0 && images.length >= maxImages && (
        <div className="rounded-xl border border-border-soft bg-surface-1 p-4 text-center flex items-center justify-center gap-2 text-sm text-fg-2">
          <ImageIcon className="h-4 w-4" />
          Maximum {maxImages} images reached. Remove one to add another.
        </div>
      )}
    </div>
  );
}