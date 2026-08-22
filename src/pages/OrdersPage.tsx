import { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router';
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
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
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

export function OrdersPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [tracking, setTracking] = useState<Record<string, OrderTracking[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || []);
        setLoading(false);
      });
  }, [session]);

  async function toggleExpand(orderId: string) {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);

    if (!orderItems[orderId]) {
      const [itemsRes, trackingRes] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', orderId),
        supabase.from('order_tracking').select('*').eq('order_id', orderId).order('created_at', { ascending: true }),
      ]);
      setOrderItems((prev) => ({
        ...prev,
        [orderId]: (itemsRes.data as OrderItem[]) || [],
      }));
      setTracking((prev) => ({
        ...prev,
        [orderId]: (trackingRes.data as OrderTracking[]) || [],
      }));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-green-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
        <p className="mt-2 text-gray-500">Sign in to view your orders.</p>
        <button onClick={() => navigate('/login')} className="btn-primary mt-6">
          Login
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">No orders yet</h1>
        <p className="mt-2 text-gray-500">
          Your orders will appear here once you start shopping.
        </p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">
          Start Shopping
        </button>
      </div>
    );
  }

  function getStepIndex(status: OrderStatus): number {
    const idx = ORDER_STATUS_FLOW.indexOf(status);
    return idx === -1 ? 0 : idx;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expanded === order.id;
          const items = orderItems[order.id] || [];
          const tracks = tracking[order.id] || [];
          const StatusIcon = STATUS_ICONS[order.status];
          const currentStep = getStepIndex(order.status);
          const isCancelled = order.status === 'cancelled';

          return (
            <div key={order.id} className="card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    <StatusIcon
                      size={22}
                      className={order.status === 'processing' ? 'animate-spin' : ''}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-brand-green-700">
                      {formatPKR(order.total)}
                    </p>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 animate-slide-up">
                  {/* Tracking timeline */}
                  {!isCancelled && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Order Tracking
                      </h3>
                      <div className="flex items-center">
                        {ORDER_STATUS_FLOW.map((step, idx) => (
                          <div key={step} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                  idx <= currentStep
                                    ? 'border-brand-green-600 bg-brand-green-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-300'
                                }`}
                              >
                                {idx < currentStep ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`mt-1.5 text-[10px] font-medium ${
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
                                className={`h-0.5 flex-1 ${
                                  idx < currentStep
                                    ? 'bg-brand-green-600'
                                    : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking records */}
                  {tracks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Tracking History
                      </h3>
                      <div className="space-y-2">
                        {tracks.map((track) => (
                          <div
                            key={track.id}
                            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                          >
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                              </p>
                              {track.note && (
                                <p className="text-xs text-gray-500">{track.note}</p>
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

                  {/* Order info */}
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-bold text-gray-900">
                        Shipping Details
                      </h3>
                      <div className="rounded-lg bg-gray-50 p-3 text-sm">
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-gray-600">{order.customer_phone}</p>
                        <p className="text-gray-600">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-bold text-gray-900">
                        Payment Details
                      </h3>
                      <div className="rounded-lg bg-gray-50 p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method</span>
                          <span className="font-medium text-gray-900">
                            {PAYMENT_METHOD_LABELS[order.payment_method]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span
                            className={`font-medium ${
                              order.payment_status === 'paid'
                                ? 'text-brand-green-700'
                                : 'text-brand-orange-600'
                            }`}
                          >
                            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <h3 className="mb-2 text-sm font-bold text-gray-900">Items</h3>
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

                  {isCancelled && (
                    <div className="mt-4 rounded-lg bg-brand-red-50 p-3 text-sm text-brand-red-700">
                      This order has been cancelled.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
