import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, LogOut, Edit2, Save } from 'lucide-react';
import { useAuth } from '@/reusable/hooks/useAuth';
import { profileSchema, type ProfileFormData } from '@/reusable/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';
import { cn } from '@/reusable/utils/helpers';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  // Mock user data if not authenticated
  const displayUser = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '08012345678',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
              {displayUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {displayUser.name}
              </h2>
              <p className="text-sm text-gray-500">{displayUser.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {displayUser.name}
                  </p>
                )}
              </div>

              {/* Email (non-editable) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-500">
                  {displayUser.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
                    {displayUser.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              {isEditing ? (
                <>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Quick Links */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </h3>
          <div className="space-y-2">
            <a
              href="/orders"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">My Orders</span>
              <span className="text-gray-400">→</span>
            </a>
            <a
              href="/wishlist"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">Wishlist</span>
              <span className="text-gray-400">→</span>
            </a>
            <a
              href="/addresses"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">Saved Addresses</span>
              <span className="text-gray-400">→</span>
            </a>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6">
          <Button
            variant="danger"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            fullWidth
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
