import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!phone.match(/^(\+234|0)[789][01]\d{8}$/)) {
      setError('Please enter a valid Nigerian phone number');
      return;
    }

    setLoading(true);

    try {
      login({ id: 1, email, phone });
      navigate('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex">
        {/* Left side - Image (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12">
          <img
              src="/jemi.png"
              alt="Jemi"
              className="max-w-md w-full object-contain"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img src="/jemi.png" alt="Jemi" className="h-10 w-10" />
              <span className="text-2xl font-bold text-gray-900">Jemi</span>
            </div>

            {/* Welcome text */}
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-600 mb-8">Join Jemi and start shopping today!</p>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
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
                    className="w-full rounded-lg border border-gray-300 bg-blue-50/50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                    placeholder="you@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-blue-50/50 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                    placeholder="08012345678"
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
                      className="w-full rounded-lg border border-gray-300 bg-blue-50/50 px-4 py-3 pr-12 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
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

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in here!
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}