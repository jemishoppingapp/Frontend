import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const navigate = useNavigate();
  const { items, openCart } = useCartStore();
  const { isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white">
      {/* Top banner */}
      <div className="bg-indigo-600">
        <p className="flex h-10 items-center justify-center px-4 text-sm font-medium text-white">
          Free pickup on orders over ₦10,000
        </p>
      </div>

      {/* Main header */}
      <header className="relative">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/jemi.webp" alt="Jemi Logo" className="h-10 w-10 object-contain" />
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative max-w-md mx-auto w-full">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-md border border-gray-300 bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </form>

            {/* Cart + Auth icons */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <button onClick={openCart} className="relative rounded-md p-2 text-gray-400 hover:text-gray-500">
                <ShoppingBagIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Auth icon - shows different style when logged in */}
              <button 
                onClick={handleAuthClick} 
                className={`rounded-md p-2 transition-colors ${
                  isAuthenticated 
                    ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                    : 'text-gray-400 hover:text-gray-500'
                }`}
                title={isAuthenticated ? 'Sign Out' : 'Sign In'}
              >
                <UserIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Header;