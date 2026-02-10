import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!phone.match(/^(\+234|234|0)[789][01]\d{8}$/)) {
      setError('Please enter a valid Nigerian phone number');
      return;
    }

    try {
      await register({ name, email, phone, password });
      showToast('success', 'Account created successfully! Welcome to JEMI.');
      navigate('/');
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
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
            <h2 className="text-2xl font-bold text-white mb-3">Join JEMI Today</h2>
            <p className="text-gray-400 max-w-sm">Create an account and start shopping for quality products at student-friendly prices.</p>
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
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-500 mb-8">Join JEMI and start shopping today!</p>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                    placeholder="Jamel Temitope"
                />
              </div>

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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
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
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors mt-2"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}