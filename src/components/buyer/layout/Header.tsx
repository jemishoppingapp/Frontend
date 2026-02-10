import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { MOCK_CATEGORIES } from '@/data/mockData';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { showToast } = useUIStore();
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
      showToast('success', 'You have been logged out successfully.');
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.search.includes(path);
  };

  return (
    <div className="bg-white">
      {/* Top banner */}
      <div className="bg-gray-900">
        <p className="flex h-9 items-center justify-center px-4 text-xs font-medium text-white">
          Free pickup on orders over ₦10,000 • LASU Campus Only
        </p>
      </div>

      {/* Main header - Dark like Oraimo */}
      <header className="bg-gray-900">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/jemi.webp" alt="JEMI" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold text-green-400 hidden sm:block">JEMI</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/products" 
                className={`text-sm font-medium transition-colors ${isActive('/products') && !location.search ? 'text-green-400' : 'text-gray-300 hover:text-white'}`}
              >
                All Products
              </Link>
              {MOCK_CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={cat.href}
                  className={`text-sm font-medium transition-colors ${isActive(cat.id) ? 'text-green-400' : 'text-gray-300 hover:text-white'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xs">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md bg-gray-800 border-0 py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400"
                />
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-3">
              {/* User greeting */}
              {isAuthenticated && user?.name && (
                <span className="hidden lg:block text-xs text-gray-400">
                  Hi, {user.name.split(' ')[0]}
                </span>
              )}

              {/* Cart */}
              <button 
                onClick={openCart} 
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              <button 
                onClick={handleAuthClick} 
                className={`p-2 transition-colors ${isAuthenticated ? 'text-green-400 hover:text-green-300' : 'text-gray-300 hover:text-white'}`}
                title={isAuthenticated ? 'Sign Out' : 'Sign In'}
              >
                <UserIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile category nav */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex px-4 py-2 gap-4">
          <Link 
            to="/products" 
            className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              isActive('/products') && !location.search 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </Link>
          {MOCK_CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={cat.href}
              className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                isActive(cat.id) 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;