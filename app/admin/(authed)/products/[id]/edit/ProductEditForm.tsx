'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  seller: string;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  imageUrl: string;
}

const CATEGORIES = ['fashion', 'electronics', 'food', 'accessories'];

export function ProductEditForm({ product }: { product: ProductData }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice ? String(product.originalPrice) : '');
  const [category, setCategory] = useState(product.category);
  const [seller, setSeller] = useState(product.seller);
  const [stockQuantity, setStockQuantity] = useState(String(product.stockQuantity));
  const [inStock, setInStock] = useState(product.inStock);
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [features, setFeatures] = useState<string[]>(product.features.length > 0 ? product.features : ['']);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
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

      await apiFetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        body: {
          name,
          description,
          price: priceNum,
          originalPrice: origNum,
          category,
          seller,
          stockQuantity: stockNum,
          inStock,
          isActive,
          isFeatured,
          features: features.filter((f) => f.trim().length > 0),
          imageUrl: imageUrl.trim() || null,
        },
      });
      toast.success('Product saved');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Soft-delete "${product.name}"? It will be hidden from buyers but order history is preserved. You can re-enable later by editing.`)) {
      return;
    }
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      toast.success('Product hidden');
      router.push('/admin/products');
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
            <p className="text-[11px] text-fg-3 mt-1">Slug can't be changed (would break links).</p>
          </div>
          <div>
            <Label htmlFor="description" className="text-fg-1">Description</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-fg-1">Category</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                {CATEGORIES.map((c) => (<option key={c} value={c} className="capitalize">{c}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="seller" className="text-fg-1">Seller</Label>
              <Input id="seller" value={seller} onChange={(e) => setSeller(e.target.value)} required className="mt-1.5 bg-surface" />
            </div>
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
        <h2 className="font-display text-base font-semibold text-fg mb-5">Image</h2>
        <Label htmlFor="imageUrl" className="text-fg-1">Image URL</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/... or any URL" className="mt-1.5 bg-surface font-mono text-xs" />
        <p className="text-[11px] text-fg-3 mt-1">Cloudinary upload UI coming later — paste a direct URL for now.</p>
        {imageUrl && (
          <div className="mt-3 inline-block bg-surface-1 border border-border-soft rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Preview" className="h-24 w-24 object-cover" />
          </div>
        )}
      </section>

      <section className="bg-surface border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Features</h2>
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
        <div className="space-y-3">
          <Toggle label="Active (visible to buyers)" checked={isActive} onChange={setIsActive} />
          <Toggle label="In stock" checked={inStock} onChange={setInStock} />
          <Toggle label="Featured (homepage)" checked={isFeatured} onChange={setIsFeatured} />
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" variant="default" size="tap" disabled={saving}>
          {saving ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" size="tap" onClick={handleDelete} disabled={deleting}
          className="text-danger hover:bg-danger/5">
          {deleting ? (<><Loader2 className="h-4 w-4 animate-spin" />Deleting…</>) : 'Hide product'}
        </Button>
      </div>
    </form>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary" />
      <span className="text-sm text-fg">{label}</span>
    </label>
  );
}