'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

interface Bank { name: string; code: string; }

const BUSINESS_TYPES = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export function SellerApplyForm() {
  // Personal
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Business
  const [businessName, setBusinessName] = useState('');
  const [businessTypeCategory, setBusinessTypeCategory] = useState('fashion');
  const [businessTypeNotes, setBusinessTypeNotes] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');

  // Bank
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load bank list on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ banks: Bank[] }>('/api/sellers/banks');
        setBanks(data.banks);
      } catch {
        toast.error("Couldn't load bank list. You can still apply — type the bank name in.");
      } finally {
        setLoadingBanks(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldError(null);

    const selectedBank = banks.find((b) => b.code === bankCode);
    if (!selectedBank) {
      setFieldError({ field: 'bankCode', message: 'Please select your bank.' });
      setSubmitting(false);
      return;
    }

    try {
      await apiFetch('/api/sellers/apply', {
        method: 'POST',
        body: {
          fullName, email, password, phone,
          businessName, businessTypeCategory, businessTypeNotes,
          businessAddress, businessPhone,
          bankAccountName, bankAccountNumber,
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
        },
      });
      // Logged in by the API now — redirect to pending page
      window.location.href = '/sellers/pending';
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) {
          setFieldError({ field: err.field, message: err.message });
          // Scroll to the field if we can
          const el = document.getElementById(err.field);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Personal</h2>
        <p className="text-xs text-fg-2 mb-5">This is your login. Use a fresh email — separate from any buyer account you have on JEMI.</p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-fg-1">Full name <span className="text-danger">*</span></Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2}
              className="mt-1.5 bg-surface" />
            {fieldError?.field === 'fullName' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-fg-1">Email <span className="text-danger">*</span></Label>
              <Input id="email" type="email" inputMode="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="mt-1.5 bg-surface" placeholder="you@example.com" />
              {fieldError?.field === 'email' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
            </div>
            <div>
              <Label htmlFor="phone" className="text-fg-1">Phone <span className="text-danger">*</span></Label>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel"
                value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="mt-1.5 bg-surface" placeholder="08012345678" />
              {fieldError?.field === 'phone' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-fg-1">Password <span className="text-danger">*</span></Label>
            <Input id="password" type="password" autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="mt-1.5 bg-surface" placeholder="At least 8 characters" />
            {fieldError?.field === 'password' ? (
              <p className="text-xs text-danger mt-1">{fieldError.message}</p>
            ) : (
              <p className="text-[11px] text-fg-3 mt-1.5">8+ characters with a letter and a number.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-5">Business</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName" className="text-fg-1">Business name <span className="text-danger">*</span></Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required minLength={2}
              className="mt-1.5 bg-surface" placeholder="e.g. Ada's Closet" />
            {fieldError?.field === 'businessName' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
          </div>
          <div>
            <Label htmlFor="businessTypeCategory" className="text-fg-1">What do you sell? <span className="text-danger">*</span></Label>
            <select id="businessTypeCategory" value={businessTypeCategory} onChange={(e) => setBusinessTypeCategory(e.target.value)}
              required
              className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-base text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
              {BUSINESS_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <Label htmlFor="businessTypeNotes" className="text-fg-1">Tell us more (optional)</Label>
            <Input id="businessTypeNotes" value={businessTypeNotes} onChange={(e) => setBusinessTypeNotes(e.target.value)}
              className="mt-1.5 bg-surface"
              placeholder="e.g. handmade ankara dresses, vintage sneakers, smoothies…" maxLength={500} />
          </div>
          <div>
            <Label htmlFor="businessAddress" className="text-fg-1">Business address <span className="text-danger">*</span></Label>
            <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required minLength={5}
              className="mt-1.5 bg-surface" placeholder="Where do you store your products?" />
            {fieldError?.field === 'businessAddress' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
          </div>
          <div>
            <Label htmlFor="businessPhone" className="text-fg-1">Business phone <span className="text-danger">*</span></Label>
            <Input id="businessPhone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} required
              className="mt-1.5 bg-surface" placeholder="What buyers/admin can reach you on" />
            <p className="text-[11px] text-fg-3 mt-1">Can be the same as your personal phone.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-1 border border-border-soft rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-fg mb-2">Bank for payouts</h2>
        <p className="text-xs text-fg-2 mb-5">Your share of each sale (95%) gets paid here when orders complete.</p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankCode" className="text-fg-1">Bank <span className="text-danger">*</span></Label>
            {loadingBanks ? (
              <div className="mt-1.5 h-11 flex items-center px-3 rounded-md border border-border bg-surface text-sm text-fg-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading banks…
              </div>
            ) : (
              <select id="bankCode" value={bankCode} onChange={(e) => setBankCode(e.target.value)} required
                className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-surface text-base text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Select your bank…</option>
                {banks.map((b) => (<option key={b.code} value={b.code}>{b.name}</option>))}
              </select>
            )}
            {fieldError?.field === 'bankCode' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
          </div>
          <div>
            <Label htmlFor="bankAccountNumber" className="text-fg-1">Account number <span className="text-danger">*</span></Label>
            <Input id="bankAccountNumber" inputMode="numeric" pattern="\d{10}"
              value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))} required
              maxLength={10}
              className="mt-1.5 bg-surface font-mono" placeholder="10-digit account number" />
            {fieldError?.field === 'bankAccountNumber' ? (
              <p className="text-xs text-danger mt-1">{fieldError.message}</p>
            ) : (
              <p className="text-[11px] text-fg-3 mt-1">Exactly 10 digits.</p>
            )}
          </div>
          <div>
            <Label htmlFor="bankAccountName" className="text-fg-1">Account name <span className="text-danger">*</span></Label>
            <Input id="bankAccountName" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} required
              className="mt-1.5 bg-surface" placeholder="Name on the bank account" />
            {fieldError?.field === 'bankAccountName' && (<p className="text-xs text-danger mt-1">{fieldError.message}</p>)}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-primary-soft bg-primary-soft/30 p-5 text-sm text-fg-1">
        <p className="font-medium text-fg mb-1">What happens next</p>
        <ol className="list-decimal pl-4 space-y-1 text-fg-2 text-xs leading-relaxed">
          <li>We review your application within 48 hours.</li>
          <li>We email you when approved with next steps.</li>
          <li>Once approved, log in at <code className="text-primary font-mono">/login</code> to upload products and manage orders.</li>
        </ol>
      </div>

      <Button type="submit" variant="default" size="tap" className="w-full" disabled={submitting || loadingBanks}>
        {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>) : 'Submit application'}
      </Button>

      <p className="text-[11px] text-fg-3 text-center">
        By submitting you agree to JEMI's <a href="/terms" className="text-primary hover:underline">Terms</a>{' '}
        and acknowledge our 5% platform fee per sale.
      </p>
    </form>
  );
}