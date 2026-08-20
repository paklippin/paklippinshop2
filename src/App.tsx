import { useRoute, parseRoute } from '@/lib/router';
import { AuthProvider } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { AuthPage } from '@/pages/AuthPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { AdminPage } from '@/pages/AdminPage';

function Router() {
  const route = useRoute();
  const parsed = parseRoute(route);
  switch (parsed.base) {
    case '/': return <HomePage />;
    case '/shop': return <ShopPage />;
    case '/login': return <AuthPage mode="login" />;
    case '/signup': return <AuthPage mode="signup" />;
    case '/product': return <ProductDetailPage />;
    case '/cart': return <CartPage />;
    case '/checkout': return <CheckoutPage />;
    case '/orders': return <OrdersPage />;
    case '/track': return <TrackOrderPage />;
    case '/admin': return <AdminPage />;
    default: return <HomePage />;
  }
}

export default function App() {
  return (
    <AuthProvider><CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar /><main className="flex-1"><Router /></main><Footer />
      </div>
    </CartProvider></AuthProvider>
  );
}
