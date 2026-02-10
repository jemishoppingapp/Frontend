import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginWithCredentials({ email, password });
      showToast('success', 'Welcome back! Login successful.');
      navigate('/');
    } catch (err: any) {
      const message = err.message || 'Invalid email or password';
      setError(message);
      showToast('error', message);
    }
  };

  return (
      <div className="min-h-screen flex">
        {/* Left side - Dark background with logo (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12">
          <div className="text-center">
            <img src="/jemi2.webp" alt="Jemi" className="max-w-xs w-full mx-auto mb-8" />
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to JEMI</h2>
            <p className="text-gray-400 max-w-sm">Your trusted campus marketplace for quality products at student-friendly prices.</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img src="/jemi.webp" alt="Jemi" className="h-8 w-15" />
              <span className="text-2xl font-bold text-green-500">JEMI</span>
            </div>

            {/* Welcome text */}
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-500 mb-8">Sign into your account to continue shopping.</p>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                    placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                      placeholder="••••••••"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password & Submit */}
              <div className="flex items-center justify-between pt-2">
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-500 font-medium">
                  Forgot Password?
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Register link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-500 font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}