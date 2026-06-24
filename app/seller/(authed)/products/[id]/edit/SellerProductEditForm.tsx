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

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  features: string[];
  images: UploadedImage[];
}

export function SellerProductEditForm({
  product, declaredCategory,
}: {
  product: ProductData;
  declaredCategory: string;
}) {
  const router = useRouter();
  const lockedCategory = declaredCategory !== 'other' && CATEGORIES.includes(declaredCategory);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice ? String(product.originalPrice) : '');
  const [category, setCategory] = useState(product.category);
  const [stockQuantity, setStockQuantity] = useState(String(product.stockQuantity));
  const [isActive, setIsActive] = useState(product.isActive);
  const [features, setFeatures] = useState<string[]>(product.features.length > 0 ? product.features : ['']);
  const [images, setImages] = useState<UploadedImage[]>(product.images);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function addFeature() { setFeatures([...features, '']); }
  function removeFeature(idx: number) { setFeatures(features.filter((_, i) => i !== idx)); }
  function updateFeature(idx: number, value: string) {
    setFeatures(features.map((f, i) => i === idx ? value : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const priceNum = parseFloat(price);
      const stockNum = parseInt(stockQuantity, 10);
      const origNum = originalPrice ? parseFloat(originalPrice) : null;

      if (Number.isNaN(priceNum) || priceNum < 0) throw new Error('Price must be a positive number.');
      if (Number.isNaN(stockNum) || stockNum < 0) throw new Error('Stock must be a non-negative integer.');

      await apiFetch(`/api/seller/products/${product.id}`, {
        method: 'PATCH',
        body: {
          name, description,
          price: priceNum, originalPrice: origNum,
          category,
          stockQuantity: stockNum,
          isActive,
          features: features.filter((f) => f.trim().length > 0),
          images: images.map((img) => ({
            url: img.url, publicId: img.publicId, alt: img.alt || name,
          })),
        },
      });
      toast.success('Product saved');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else if (err instanceof Error) toast.error(err.message);
      else toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Hide "${product.name}" from buyers? You can re-activate later. Order history is preserved.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/seller/products/${product.id}`, { method: 'DELETE' });
      toast.success('Product hidden');
      router.push('/seller/products');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Basics</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-fg-1">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 bg-surface" />
          </div>
          <div>
            <Label htmlFor="slug" className="text-fg-1">Slug</Label>
            <Input id="slug" value={product.slug} disabled className="mt-1.5 bg-surface-1 font-mono text-xs" />
            <p className="text-[11px] text-fg-3 mt-1">Slug can't be changed.</p>
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
              </div>
            ) : (
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                {CATEGORIES.map((c) => (<option key={c} value={c} className="capitalize">{c}</option>))}
              </select>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Pricing & stock</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-fg-1">Price (₦)</Label>
            <Input id="price" type="number" inputMode="numeric" step="0.01" min="0" value={price}
              onChange={(e) => setPrice(e.target.value)} required className="mt-1.5 bg-surface" />
            {/* POD_BREAKDOWN */}
            {price && !Number.isNaN(parseFloat(price)) && parseFloat(price) > 0 && (
              <div className="mt-2 rounded-lg border border-primary/30 bg-primary-soft/30 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-2">Buyers pay</span>
                  <span className="font-semibold text-fg">₦{parseFloat(price).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1.5 pt-1.5 border-t border-primary/20">
                  <span className="font-medium text-fg">You receive</span>
                  <span className="font-bold text-primary-text">₦{(parseFloat(price) * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="originalPrice" className="text-fg-1">Original price (₦, optional)</Label>
            <Input id="originalPrice" type="number" inputMode="numeric" step="0.01" min="0" value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)} className="mt-1.5 bg-surface" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="stockQuantity" className="text-fg-1">Stock quantity</Label>
            <Input id="stockQuantity" type="number" inputMode="numeric" min="0" value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)} required className="mt-1.5 bg-surface" />
          </div>
        </div>
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Images</h2>
        <CloudinaryUploader images={images} onChange={setImages} productName={name} maxImages={5} />
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Features</h2>
        <div className="space-y-2">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={f} onChange={(e) => updateFeature(idx, e.target.value)} className="bg-surface" />
              <button type="button" onClick={() => removeFeature(idx)}
                className="tap shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-fg-2 hover:text-danger hover:bg-danger/5 transition-colors"
                aria-label="Remove">
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
          <span className="text-sm text-fg">Active (visible to buyers)</span>
        </label>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" variant="default" size="tap" disabled={saving}>
          {saving ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" size="tap" onClick={handleDelete} disabled={deleting}
          className="text-danger hover:bg-danger/5">
          {deleting ? (<><Loader2 className="h-4 w-4 animate-spin" />Hiding…</>) : 'Hide product'}
        </Button>
      </div>
    </form>
  );
}