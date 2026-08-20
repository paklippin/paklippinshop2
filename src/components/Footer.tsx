import { navigate } from '@/lib/router';
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div><h3 className="text-white font-bold text-lg mb-3">PakLippin</h3><p className="text-sm">Your trusted Pakistani marketplace. Quality products, nationwide delivery.</p></div>
          <div><h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('/shop')} className="block hover:text-white">Shop All</button>
              <button onClick={() => navigate('/track')} className="block hover:text-white">Track Order</button>
              <button onClick={() => navigate('/cart')} className="block hover:text-white">Cart</button>
            </div>
          </div>
          <div><h4 className="text-white font-semibold mb-3">Contact</h4><p className="text-sm">info@paklippin.com</p><p className="text-sm">Pakistan</p></div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">&copy; 2026 PakLippin. All rights reserved.</div>
      </div>
    </footer>
  );
}
