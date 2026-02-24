import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">Please log in to view your profile.</p>
        <Link to="/login" className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800">
          Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.nickname || user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500">{user?.phone || 'No phone set'}</p>
          </div>
        </div>

        {/* Profile details */}
        {user?.profile_completed && (
          <div className="border-t pt-4 mb-4 space-y-2 text-sm">
            {user.department && (
              <p className="text-gray-600">Department: <span className="font-medium text-gray-900">{user.department}</span></p>
            )}
            {user.level && (
              <p className="text-gray-600">Level: <span className="font-medium text-gray-900">{user.level}</span></p>
            )}
            {user.address && (
              <p className="text-gray-600">Address: <span className="font-medium text-gray-900">{user.address}</span></p>
            )}
            {user.alt_phone && (
              <p className="text-gray-600">Alt. Phone: <span className="font-medium text-gray-900">{user.alt_phone}</span></p>
            )}
          </div>
        )}

        {!user?.profile_completed && (
          <div className="border-t pt-4 mb-4">
            <Link
              to="/profile/complete"
              className="block w-full text-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 text-sm"
            >
              Complete Your Profile
            </Link>
            <p className="text-xs text-gray-500 mt-2 text-center">Required before you can checkout</p>
          </div>
        )}

        <div className="space-y-4 border-t pt-4">
          <Link to="/orders" className="block text-green-600 hover:text-green-500">
            View Orders
          </Link>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
