'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';
import { CloudinaryUploader, type UploadedImage } from '@/components/admin/CloudinaryUploader';

const CATEGORIES = ['fashion', 'electronics', 'food', 'accessories'];

function slugify(input: string): string {
  return input.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

interface Props {
  sellerBusinessName: string;
  declaredCategory: string;
}

export function SellerNewProductForm({ sellerBusinessName, declaredCategory }: Props) {
  const router = useRouter();
  // If seller declared a specific category, lock to it. If 'other', let them pick.
  const lockedCategory = declaredCategory !== 'other' && CATEGORIES.includes(declaredCategory);
  const initialCategory = lockedCategory ? declaredCategory : CATEGORIES[0];

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category] = useState(initialCategory);
  const [pickedCategory, setPickedCategory] = useState(initialCategory);
  const [stockQuantity, setStockQuantity] = useState('10');
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>(['']);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }
  function handleSlugChange(value: string) {
    setSlug(slugify(value));
    setSlugTouched(true);
  }
  function addFeature() { setFeatures([...features, '']); }
  function removeFeature(idx: number) { setFeatures(features.filter((_, i) => i !== idx)); }
  function updateFeature(idx: number, value: string) {
    setFeatures(features.map((f, i) => i === idx ? value : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!slug) throw new Error('Slug is required (auto-fills from name).');
      const priceNum = parseFloat(price);
      const stockNum = parseInt(stockQuantity, 10);
      const origNum = originalPrice ? parseFloat(originalPrice) : null;

      if (Number.isNaN(priceNum) || priceNum < 0) throw new Error('Price must be a positive number.');
      if (Number.isNaN(stockNum) || stockNum < 0) throw new Error('Stock must be a non-negative integer.');
      if (images.length === 0) throw new Error('Please add at least one image.');

      const created = await apiFetch<{ id: string; slug: string }>('/api/seller/products', {
        method: 'POST',
        body: {
          name, slug, description,
          price: priceNum, originalPrice: origNum,
          category: lockedCategory ? category : pickedCategory,
          stockQuantity: stockNum,
          isActive,
          features: features.filter((f) => f.trim().length > 0),
          images: images.map((img) => ({
            url: img.url, publicId: img.publicId, alt: img.alt || name,
          })),
        },
      });
      toast.success('Product created');
      router.push(`/seller/products/${created.id}/edit`);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else if (err instanceof Error) toast.error(err.message);
      else toast.error('Could not create product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Basics</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-fg-1">Name <span className="text-danger">*</span></Label>
            <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} required
              className="mt-1.5 bg-surface" placeholder="What are you selling?" />
          </div>
          <div>
            <Label htmlFor="slug" className="text-fg-1">URL slug <span className="text-danger">*</span></Label>
            <Input id="slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} required
              className="mt-1.5 bg-surface font-mono text-xs" />
            <p className="text-[11px] text-fg-3 mt-1">Auto-fills from name. Lowercase + dashes. Can't be changed later.</p>
          </div>
          <div>
            <Label htmlFor="description" className="text-fg-1">Description</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <Label className="text-fg-1">Category</Label>
            {lockedCategory ? (
              <div className="mt-1.5 h-11 px-3 flex items-center rounded-md border border-border bg-surface-1 text-sm text-fg capitalize">
                {category}
                <span className="ml-2 text-[10px] text-fg-3 normal-case">(set when you applied)</span>
              </div>
            ) : (
              <select value={pickedCategory} onChange={(e) => setPickedCategory(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                {CATEGORIES.map((c) => (<option key={c} value={c} className="capitalize">{c}</option>))}
              </select>
            )}
          </div>
          <div>
            <Label className="text-fg-1">Seller (your business name)</Label>
            <div className="mt-1.5 h-11 px-3 flex items-center rounded-md border border-border bg-surface-1 text-sm text-fg">
              {sellerBusinessName}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Pricing & stock</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-fg-1">Price (₦) <span className="text-danger">*</span></Label>
            <Input id="price" type="number" inputMode="numeric" step="0.01" min="0" value={price}
              onChange={(e) => setPrice(e.target.value)} required className="mt-1.5 bg-surface" placeholder="0" />
          </div>
          <div>
            <Label htmlFor="originalPrice" className="text-fg-1">Original price (₦, optional)</Label>
            <Input id="originalPrice" type="number" inputMode="numeric" step="0.01" min="0" value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)} placeholder="For showing discounts" className="mt-1.5 bg-surface" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="stockQuantity" className="text-fg-1">Stock quantity</Label>
            <Input id="stockQuantity" type="number" inputMode="numeric" min="0" value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)} required className="mt-1.5 bg-surface" />
          </div>
        </div>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Images <span className="text-danger text-sm">*</span></h2>
        <p className="text-xs text-fg-2 mb-4">First image is the cover. Up to 5 images.</p>
        <CloudinaryUploader images={images} onChange={setImages} productName={name} maxImages={5} />
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Features (optional)</h2>
        <div className="space-y-2">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={f} onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="e.g. 100% organic cotton" className="bg-surface" />
              <button type="button" onClick={() => removeFeature(idx)}
                className="tap shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-fg-2 hover:text-danger hover:bg-danger/5 transition-colors"
                aria-label="Remove feature">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addFeature}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium">
            <Plus className="h-3.5 w-3.5" /> Add feature
          </button>
        </div>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary" />
          <span className="text-sm text-fg">Active (visible to buyers immediately)</span>
        </label>
      </section>

      <Button type="submit" variant="default" size="tap" disabled={saving}>
        {saving ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating…</>) : 'Create product'}
      </Button>
    </form>
  );
}