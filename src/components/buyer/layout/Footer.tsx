import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/jemi2.webp"
                alt="Jemi Logo"
                className="h-14 w-14 object-contain"
              />
            </div>
            <p className="text-sm text-gray-400">
              Your trusted campus marketplace for quality products at LASU.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-white">Shop</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="/products" className="text-sm text-gray-400 hover:text-white">All Products</Link></li>
                <li><Link to="/products?category=fashion" className="text-sm text-gray-400 hover:text-white">Fashion</Link></li>
                <li><Link to="/products?category=electronics" className="text-sm text-gray-400 hover:text-white">Electronics</Link></li>
                <li><Link to="/products?category=food" className="text-sm text-gray-400 hover:text-white">Food & Drinks</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Support</h3>
              <ul className="mt-4 space-y-3">
                <li><span className="text-sm text-gray-500 cursor-default">Help Center</span></li>
                <li><span className="text-sm text-gray-500 cursor-default">FAQs</span></li>
                <li><span className="text-sm text-gray-500 cursor-default">Pickup Info</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><span className="text-sm text-gray-500 cursor-default">About</span></li>
                <li><span className="text-sm text-gray-500 cursor-default">Contact</span></li>
                <li><span className="text-sm text-gray-500 cursor-default">Terms</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} JEMI. All rights reserved. Campus pickup at LASU &amp; Iba.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
