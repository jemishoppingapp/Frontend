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
          <Link to="/login" className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white">
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
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.phone || 'No phone set'}</p>
            </div>
          </div>
          <div className="space-y-4 border-t pt-4">
            <Link to="/orders" className="block text-indigo-600 hover:text-indigo-500">
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