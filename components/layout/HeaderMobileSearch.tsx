'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

export function HeaderMobileSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden tap w-full inline-flex items-center gap-2 bg-surface-1 hover:bg-surface-2 rounded-full h-10 px-4 text-fg-2 transition-colors border border-border-soft"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm">Search JEMI</span>
      </button>
      {open && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="top" className="p-4">
            <SheetTitle className="sr-only">Search</SheetTitle>
            <form
              action="/products"
              method="get"
              onSubmit={() => setOpen(false)}
              className="flex items-center gap-2 bg-surface-1 rounded-full h-12 px-4 border border-border"
            >
              <Search className="h-5 w-5 text-fg-2 shrink-0" />
              <input
                name="q"
                type="search"
                autoFocus
                placeholder="What are you looking for?"
                className="flex-1 bg-transparent border-0 outline-none text-base text-fg placeholder:text-fg-3"
              />
            </form>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}