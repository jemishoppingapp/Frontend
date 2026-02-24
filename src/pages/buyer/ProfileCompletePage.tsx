import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserIcon } from '@heroicons/react/24/outline';

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

const POPULAR_DEPARTMENTS = [
  'Computer Science',
  'Accounting',
  'Business Administration',
  'Mass Communication',
  'Law',
  'Economics',
  'Public Administration',
  'Political Science',
  'English',
  'Other',
];

export default function ProfileCompletePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const [form, setForm] = useState({
    nickname: user?.nickname || user?.name?.split(' ')[0] || '',
    alt_phone: user?.alt_phone || '',
    address: user?.address || '',
    department: user?.department || '',
    level: user?.level || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtherDept, setShowOtherDept] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (user?.profile_completed) {
    navigate(from);
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleDepartmentChange = (value: string) => {
    if (value === 'Other') {
      setShowOtherDept(true);
      handleChange('department', '');
    } else {
      setShowOtherDept(false);
      handleChange('department', value);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nickname.trim() || form.nickname.length < 2) newErrors.nickname = 'Nickname must be at least 2 characters';
    if (!form.alt_phone.trim()) newErrors.alt_phone = 'Alternate phone is required';
    else if (!/^(\+?234|0)[789]\d{9}$/.test(form.alt_phone.replace(/[\s-]/g, ''))) newErrors.alt_phone = 'Enter a valid Nigerian phone number';
    if (!form.address.trim() || form.address.length < 5) newErrors.address = 'Address must be at least 5 characters';
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.level) newErrors.level = 'Please select your level';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with real API call when backend is connected
      // await apiClient.put(ENDPOINTS.USER.PROFILE_COMPLETE, form);
      
      // MOCK: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateUser({ ...form, profile_completed: true });
      navigate(from);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            We need a few details to process your orders and contact you about pickup.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              Nickname / Display Name
            </label>
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="What should we call you?"
              maxLength={30}
              className={`w-full rounded-lg border ${errors.nickname ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
            />
            {errors.nickname && <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>}
          </div>

          {/* Alt Phone */}
          <div>
            <label htmlFor="alt_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone Number
            </label>
            <input
              id="alt_phone"
              type="tel"
              value={form.alt_phone}
              onChange={(e) => handleChange('alt_phone', e.target.value)}
              placeholder="e.g. 09012345678"
              maxLength={20}
              className={`w-full rounded-lg border ${errors.alt_phone ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
            />
            {errors.alt_phone && <p className="mt-1 text-xs text-red-500">{errors.alt_phone}</p>}
            <p className="mt-1 text-xs text-gray-400">In case your primary number is unreachable</p>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address (Hostel / Area)
            </label>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. Block C, Room 12, Female Hostel"
              maxLength={200}
              className={`w-full rounded-lg border ${errors.address ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
            />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            {!showOtherDept ? (
              <select
                id="department"
                value={form.department || ''}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className={`w-full rounded-lg border ${errors.department ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
              >
                <option value="">Select department</option>
                {POPULAR_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Enter your department"
                  maxLength={100}
                  className={`flex-1 rounded-lg border ${errors.department ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
                />
                <button
                  type="button"
                  onClick={() => { setShowOtherDept(false); handleChange('department', ''); }}
                  className="px-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  Back
                </button>
              </div>
            )}
            {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              id="level"
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className={`w-full rounded-lg border ${errors.level ? 'border-red-300' : 'border-gray-300'} shadow-sm text-sm focus:border-green-500 focus:ring-green-500`}
            >
              <option value="">Select level</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level}</p>}
            {form.level === 'Non-student' && (
              <p className="mt-1 text-xs text-gray-400">For Iba community members</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save & Continue to Checkout'}
          </button>
        </form>
      </div>
    </div>
  );
}
