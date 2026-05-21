'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

/**
 * Mobile search — tap the bar in the header, get a full-screen sheet
 * that slides down from the top. Submit navigates to /products?q=...
 *
 * Why this pattern: on a 360px phone, the inline search input in the
 * header has ~120px of usable width. A full-screen sheet gives the
 * keyboard the whole viewport and the input gets to be normal-sized.
 * Jumia and Konga both do this.
 */
export function HeaderMobileSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      {/* Trigger button shown only on mobile (md:hidden). The trigger
          itself is what looks like a search input — visually unified
          with the desktop variant. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden tap w-full flex items-center bg-gray-800 hover:bg-gray-700 transition-colors rounded-md h-10 px-3 gap-2"
        aria-label="Open search"
      >
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-400 truncate">
          Search products on JEMI
        </span>
      </button>

      {open && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="top"
            className="p-0 bg-white text-gray-900 max-h-screen"
          >
            <SheetTitle className="sr-only">Search</SheetTitle>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-b border-border-soft safe-top">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="tap inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1 flex items-center bg-gray-100 rounded-md h-10 px-3 gap-2">
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
                <input
                  autoFocus
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-500"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
            <div className="p-4 text-sm text-gray-500">
              Tip: try “tote bag”, “earbuds”, “noodles”.
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}