'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LEVELS = [
  '100 Level',
  '200 Level',
  '300 Level',
  '400 Level',
  '500 Level',
  'Postgraduate',
  'Staff',
  'Non-student',
];

interface Defaults {
  phone: string;
  alt_phone: string;
  address: string;
  department: string;
  level: string;
}

export function ProfileCompleteForm({
  defaults,
  fromPath,
}: {
  defaults: Defaults;
  fromPath?: string;
}) {
  const [phone, setPhone] = useState(defaults.phone);
  const [altPhone, setAltPhone] = useState(defaults.alt_phone);
  const [address, setAddress] = useState(defaults.address);
  const [department, setDepartment] = useState(defaults.department);
  const [level, setLevel] = useState(defaults.level);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          alt_phone: altPhone,
          address,
          department,
          level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      toast.success('Profile complete');
      const next = fromPath && fromPath.startsWith('/') ? fromPath : '/profile';
      window.location.href = next;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border-soft rounded-lg bg-white p-5 sm:p-6 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">
            Primary phone <span className="text-red-600">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="08012345678"
            className="mt-1"
          />
          <p className="text-[11px] text-gray-500 mt-1">Nigerian number.</p>
        </div>

        <div>
          <Label htmlFor="altPhone">Alt phone (optional)</Label>
          <Input
            id="altPhone"
            type="tel"
            inputMode="tel"
            value={altPhone}
            onChange={(e) => setAltPhone(e.target.value)}
            placeholder="08012345678"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">
          Address (on or near campus) <span className="text-red-600">*</span>
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          minLength={5}
          placeholder="e.g. Hall 4, Block C, Room 12"
          className="mt-1"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">
            Department <span className="text-red-600">*</span>
          </Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            placeholder="e.g. Computer Science"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="level">
            Level <span className="text-red-600">*</span>
          </Label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
            className="mt-1 w-full h-11 px-3 rounded-md border border-border bg-white text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select level…</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="default" size="tap" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save and continue'
          )}
        </Button>
      </div>
    </form>
  );
}