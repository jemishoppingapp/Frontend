import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            {/* Logo section */}
            <div className="flex items-center gap-2">
              <img
                src="/jemi2.png"
                alt="Jemi Logo"
                className="h-14 w-14 object-contain"
              />
            </div>
            <p className="text-sm text-gray-400">
              Your trusted marketplace for quality products.
            </p>
          </div>

          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-white">Shop</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="/products" className="text-sm text-gray-400 hover:text-white">All Products</Link></li>
                <li><Link to="/products?category=fashion" className="text-sm text-gray-400 hover:text-white">Fashion</Link></li>
                <li><Link to="/products?category=electronics" className="text-sm text-gray-400 hover:text-white">Electronics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Support</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Jemi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
