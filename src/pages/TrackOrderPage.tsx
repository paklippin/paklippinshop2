import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import type { Order, OrderItem, OrderTracking, OrderStatus } from '@/lib/types';
import {
  formatPKR,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_FLOW,
} from '@/lib/types';
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-brand-orange-100 text-brand-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-brand-orange-100 text-brand-orange-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-brand-green-100 text-brand-green-700',
  cancelled: 'bg-brand-red-100 text-brand-red-700',
};

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export function TrackOrderPage() {
  const { session } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tracks, setTracks] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      let query = supabase.from('orders').select('*').eq('id', orderId.trim());
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      }

      const { data, error: queryError } = await query.maybeSingle();

      if (queryError) throw queryError;
      if (!data) {
        setOrder(null);
        setError(
          session
            ? 'Order not found in your account. Please check the Order ID.'
            : 'Please log in to track your orders by ID.'
        );
        setLoading(false);
        return;
      }

      const orderData = data as Order;
      setOrder(orderData);

      const [itemsRes, trackingRes] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', orderData.id),
        supabase
          .from('order_tracking')
          .select('*')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: true }),
      ]);

      setItems((itemsRes.data as OrderItem[]) || []);
      setTracks((trackingRes.data as OrderTracking[]) || []);
    } catch {
      setError('Failed to find order. Please check your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  function getStepIndex(status: OrderStatus): number {
    const idx = ORDER_STATUS_FLOW.indexOf(status);
    return idx === -1 ? 0 : idx;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-100">
          <Package size={32} className="text-brand-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        <p className="mt-2 text-gray-500">
          Enter your order ID to see the current status and tracking history.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card mb-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order ID (e.g. a1b2c3d4-...)"
              className="input-field pl-10 font-mono text-sm"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Searching...
              </>
            ) : (
              'Track Order'
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          You can find your Order ID in the "My Orders" page after placing an order.
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="card mb-6 flex items-start gap-3 border-l-4 border-l-brand-red-500 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-brand-red-600" />
          <p className="text-sm text-brand-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {order && !error && (
        <div className="space-y-6 animate-slide-up">
          {/* Order header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-gray-900">
                  {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[order.status]} text-sm`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleDateString('en-PK')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-medium text-brand-green-700">
                  {formatPKR(order.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="font-medium text-gray-900">
                  {PAYMENT_METHOD_LABELS[order.payment_method]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pay Status</p>
                <p
                  className={`font-medium ${
                    order.payment_status === 'paid'
                      ? 'text-brand-green-700'
                      : 'text-brand-orange-600'
                  }`}
                >
                  {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking timeline */}
          {order.status !== 'cancelled' ? (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Order Progress</h2>
              <div className="flex items-center">
                {ORDER_STATUS_FLOW.map((step, idx) => {
                  const currentStep = getStepIndex(order.status);
                  const StatusIcon = STATUS_ICONS[step];
                  return (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                            idx <= currentStep
                              ? 'border-brand-green-600 bg-brand-green-600 text-white'
                              : 'border-gray-300 bg-white text-gray-300'
                          }`}
                        >
                          <StatusIcon
                            size={20}
                            className={
                              step === order.status && step === 'processing'
                                ? 'animate-spin'
                                : ''
                            }
                          />
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            idx <= currentStep
                              ? 'text-brand-green-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[step]}
                        </span>
                      </div>
                      {idx < ORDER_STATUS_FLOW.length - 1 && (
                        <div
                          className={`h-1 flex-1 ${
                            idx < currentStep ? 'bg-brand-green-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card flex items-center gap-3 border-l-4 border-l-brand-red-500 p-4">
              <XCircle size={24} className="text-brand-red-600" />
              <p className="text-sm font-medium text-brand-red-700">
                This order has been cancelled.
              </p>
            </div>
          )}

          {/* Tracking history */}
          {tracks.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Tracking History
              </h2>
              <div className="space-y-3">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          idx === 0
                            ? 'bg-brand-green-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {idx === 0 ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      {idx < tracks.length - 1 && (
                        <div className="h-full w-0.5 flex-1 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                      </p>
                      {track.note && (
                        <p className="text-sm text-gray-500">{track.note}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(track.created_at).toLocaleString('en-PK')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          {items.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Order Items</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatPKR(item.unit_price)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-700">
                      {formatPKR(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!order && !error && !searched && (
        <div className="card p-8 text-center text-gray-400">
          <Search size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Enter an order ID above to track your order.</p>
        </div>
      )}
    </div>
  );
}
