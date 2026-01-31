import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingSchema, type ShippingFormData } from '@/reusable/utils/validators';
import { NIGERIAN_STATES } from '@/reusable/utils/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormData>;
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

export function ShippingForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      notes: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Shipping Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          required
          {...register('email')}
        />
      </div>

      <Input
        label="Phone Number"
        type="tel"
        placeholder="08012345678"
        error={errors.phone?.message}
        required
        {...register('phone')}
      />

      <Input
        label="Delivery Address"
        placeholder="Enter your street address"
        error={errors.address?.message}
        required
        {...register('address')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="Enter your city"
          error={errors.city?.message}
          required
          {...register('city')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            {...register('state')}
          >
            <option value="">Select a state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Delivery Notes (Optional)
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-none"
          placeholder="Any special instructions for delivery..."
          {...register('notes')}
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} className="mt-6">
        Continue to Payment
      </Button>
    </form>
  );
}

export default ShippingForm;
