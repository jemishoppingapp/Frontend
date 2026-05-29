'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate', 'Staff', 'Non-student'];

interface Defaults { phone: string; alt_phone: string; address: string; department: string; level: string; }

export function ProfileCompleteForm({ defaults, fromPath }: { defaults: Defaults; fromPath?: string }) {
  const [phone, setPhone] = useState(defaults.phone);
  const [altPhone, setAltPhone] = useState(defaults.alt_phone);
  const [address, setAddress] = useState(defaults.address);
  const [department, setDepartment] = useState(defaults.department);
  const [level, setLevel] = useState(defaults.level);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldError(null);
    try {
      await apiFetch<{ saved: boolean }>('/api/user/profile/complete', {
        method: 'POST',
        body: { phone, alt_phone: altPhone, address, department, level },
      });
      toast.success('Profile complete');
      const next = fromPath && fromPath.startsWith('/') ? fromPath : '/profile';
      window.location.href = next;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) {
          setFieldError({ field: err.field, message: err.message });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Save failed');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-1 border border-border-soft rounded-2xl p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-fg-1">Primary phone <span className="text-danger">*</span></Label>
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel"
            value={phone} onChange={(e) => setPhone(e.target.value)} required
            placeholder="08012345678" className="mt-1.5 bg-surface" />
          {fieldError?.field === 'phone' ? (
            <p className="text-xs text-danger mt-1">{fieldError.message}</p>
          ) : (
            <p className="text-[11px] text-fg-3 mt-1">Nigerian number.</p>
          )}
        </div>
        <div>
          <Label htmlFor="altPhone" className="text-fg-1">Alt phone (optional)</Label>
          <Input id="altPhone" type="tel" inputMode="tel" value={altPhone}
            onChange={(e) => setAltPhone(e.target.value)} placeholder="08012345678" className="mt-1.5 bg-surface" />
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-fg-1">Address (on/near campus) <span className="text-danger">*</span></Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required minLength={5}
          placeholder="e.g. Hall 4, Block C, Room 12" className="mt-1.5 bg-surface" />
        {fieldError?.field === 'address' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department" className="text-fg-1">Department <span className="text-danger">*</span></Label>
          <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required
            placeholder="e.g. Computer Science" className="mt-1.5 bg-surface" />
        </div>
        <div>
          <Label htmlFor="level" className="text-fg-1">Level <span className="text-danger">*</span></Label>
          <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} required
            className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-base text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">Select level…</option>
            {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="default" size="tap" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving…</>) : 'Save and continue'}
        </Button>
      </div>
    </form>
  );
}