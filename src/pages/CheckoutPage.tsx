import { useState, useRef } from 'react';
import { useNavigate } from '@/lib/router';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPKR, type PaymentMethod } from '@/lib/types';
import {
  Loader2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  AlertCircle,
  Upload,
  FileCheck2,
  MessageCircle,
  IdCard,
  Banknote,
} from 'lucide-react';

const PAYMENT_OPTIONS: {
  method: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Smartphone;
  color: string;
}[] = [
  {
    method: 'easypaisa',
    label: 'EasyPaisa',
    desc: 'Send money to EasyPaisa account',
    icon: Smartphone,
    color: 'text-brand-green-600 bg-brand-green-50',
  },
  {
    method: 'jazzcash',
    label: 'JazzCash',
    desc: 'Send money to JazzCash account',
    icon: Smartphone,
    color: 'text-brand-red-600 bg-brand-red-50',
  },
  {
    method: 'bank_transfer',
    label: 'Bank Transfer',
    desc: 'Direct bank deposit / transfer',
    icon: Building,
    color: 'text-brand-orange-600 bg-brand-orange-50',
  },
  {
    method: 'card',
    label: 'Debit/Credit Card',
    desc: 'Mastercard or Visa — no KYC required',
    icon: CreditCard,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    method: 'cod',
    label: 'Cash on Delivery',
    desc: 'Pay in cash when you receive — 6% extra + Rs 300 delivery (paid upfront)',
    icon: Banknote,
    color: 'text-brand-orange-600 bg-brand-orange-50',
  },
];

const PAYMENT_DETAILS: Record<PaymentMethod, { account: string; name: string; label: string }> = {
  easypaisa: { account: '0339-7910131', name: 'Shouaib Imran', label: 'EasyPaisa Account' },
  jazzcash: { account: '0339-7910131', name: 'Shouaib Imran', label: 'JazzCash Account' },
  bank_transfer: { account: 'HBL · A/C: 1234-5678901-001', name: 'PakLippin Pvt Ltd', label: 'Bank Account' },
  card: { account: '', name: '', label: '' },
  cod: { account: '0339-7910131', name: 'Shouaib Imran', label: 'Pay Delivery Fee Upfront (EasyPaisa)' },
};

const WHATSAPP_URL = 'https://wa.me/923397579547';
const COD_DELIVERY_FEE = 300;
const COD_SURCHARGE_RATE = 0.06;
const GOVT_TAX_RATE = 0.02;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { profile, session } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const needsKyc = paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' || paymentMethod === 'bank_transfer';
  const isCod = paymentMethod === 'cod';

  if (!session) {
    navigate('/login');
    return null;
  }

  // Calculate charges
  const baseDeliveryFee = isCod
    ? COD_DELIVERY_FEE
    : totalPrice >= 5000
      ? 0
      : 200;
  const codSurcharge = isCod ? Math.round(totalPrice * COD_SURCHARGE_RATE) : 0;
  const govtTax = isCod ? Math.round(totalPrice * GOVT_TAX_RATE) : 0;
  const grandTotal = totalPrice + baseDeliveryFee + codSurcharge + govtTax;

  const paymentDetail = PAYMENT_DETAILS[paymentMethod];

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-green-100">
          <CheckCircle2 size={48} className="text-brand-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-2 text-gray-600">
          Your order has been placed. You can track its status anytime.
        </p>
        <div className="card mt-6 p-6 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm font-medium text-gray-500">Order ID</span>
            <span className="font-mono text-sm font-bold text-gray-900">
              {success.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className="badge bg-brand-orange-100 text-brand-orange-700">
              Pending
            </span>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => navigate('/orders')} className="btn-primary">
            View My Orders
          </button>
          <button onClick={() => navigate('/shop')} className="btn-outline">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <p className="text-xl font-semibold text-gray-700">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-4">
          Go to Shop
        </button>
      </div>
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('ID card image must be under 5MB');
      return;
    }
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
    setError('');
  }

  function clearFile() {
    setIdCardFile(null);
    setIdCardPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (needsKyc && !idCardFile) {
      setError('Please upload your ID card (CNIC) for KYC verification. This is required for mobile payments and bank transfers.');
      return;
    }

    if (isCod && !idCardFile) {
      setError('Please upload your ID card (CNIC). KYC is required for Cash on Delivery orders.');
      return;
    }

    setLoading(true);

    try {
      if (!session?.user) throw new Error('Not authenticated');

      let kycDocumentUrl: string | null = null;

      if ((needsKyc || isCod) && idCardFile) {
        setUploading(true);
        const fileExt = idCardFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(fileName, idCardFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(fileName);

        kycDocumentUrl = urlData.publicUrl;
        setUploading(false);
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          is_pos_order: false,
          customer_name: name,
          customer_phone: phone,
          shipping_address: address,
          total: grandTotal,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: isCod ? 'unpaid' : 'unpaid',
          kyc_document_url: kycDocumentUrl,
          cod_surcharge: codSurcharge,
          delivery_fee: baseDeliveryFee,
          govt_tax: govtTax,
          cod_delivery_paid: false,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      const orderId = (orderData as { id: string }).id;

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      setSuccess(orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid gap-6 lg:grid-cols-3">
        {/* Left: shipping + payment + KYC */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping info */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Truck size={20} className="text-brand-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Ahmed Khan"
                />
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">Delivery Address</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="House #, Street, Area, City, Province"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-brand-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.method}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === opt.method
                      ? 'border-brand-green-600 bg-brand-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.method}
                    checked={paymentMethod === opt.method}
                    onChange={() => {
                      setPaymentMethod(opt.method);
                      setError('');
                    }}
                    className="h-5 w-5 accent-brand-green-600"
                  />
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${opt.color}`}
                  >
                    <opt.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Payment account details — shown for easypaisa, jazzcash, bank_transfer */}
            {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' || paymentMethod === 'bank_transfer') && paymentDetail.account && (
              <div className="mt-4 rounded-xl border-2 border-brand-green-200 bg-brand-green-50 p-4">
                <p className="text-sm font-bold text-brand-green-800">
                  {paymentDetail.label} — Send Payment Here:
                </p>
                <div className="mt-2 space-y-1 text-sm text-brand-green-900">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-green-700">Account Number:</span>
                    <span className="font-bold font-mono">{paymentDetail.account}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-green-700">Account Name:</span>
                    <span className="font-bold">{paymentDetail.name}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-brand-green-700">
                  After sending payment, please share the transaction receipt with us on WhatsApp to confirm your order.
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1da851]"
                >
                  <MessageCircle size={14} />
                  Share Receipt on WhatsApp
                </a>
              </div>
            )}

            {/* Card payment info */}
            {paymentMethod === 'card' && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">Debit/Credit Card Payment</p>
                <p className="mt-1">Pay securely with your Mastercard or Visa debit/credit card. Your payment is processed instantly and securely.</p>
                <p className="mt-2 rounded bg-brand-green-100 px-2 py-1 text-xs font-medium text-brand-green-800">No KYC Required — card payments are processed securely without additional verification.</p>
              </div>
            )}

            {/* COD payment info */}
            {isCod && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border-2 border-brand-orange-200 bg-brand-orange-50 p-4">
                  <p className="text-sm font-bold text-brand-orange-800">Cash on Delivery — Charges Breakdown:</p>
                  <div className="mt-2 space-y-1.5 text-sm text-brand-orange-900">
                    <div className="flex items-center justify-between">
                      <span>COD Surcharge (6%):</span>
                      <span className="font-bold">{formatPKR(codSurcharge)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-bold">{formatPKR(COD_DELIVERY_FEE)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Government Tax (2%):</span>
                      <span className="font-bold">{formatPKR(govtTax)}</span>
                    </div>
                  </div>
                </div>

                {/* Upfront delivery fee payment */}
                <div className="rounded-xl border-2 border-brand-green-200 bg-brand-green-50 p-4">
                  <p className="text-sm font-bold text-brand-green-800">
                    Pay Delivery Fee Upfront ({formatPKR(COD_DELIVERY_FEE)})
                  </p>
                  <p className="mt-1 text-xs text-brand-green-700">
                    For COD orders, the delivery fee must be paid upfront via EasyPaisa before your order is confirmed.
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-brand-green-900">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-green-700">Account Number:</span>
                      <span className="font-bold font-mono">0339-7910131</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-green-700">Account Name:</span>
                      <span className="font-bold">Shouaib Imran</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-green-700">Amount to Send:</span>
                      <span className="font-bold text-brand-green-800">{formatPKR(COD_DELIVERY_FEE)}</span>
                    </div>
                  </div>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1da851]"
                  >
                    <MessageCircle size={14} />
                    Send Delivery Fee Receipt on WhatsApp
                  </a>
                </div>

                {/* KYC notice for COD */}
                <div className="flex items-start gap-2 rounded-lg bg-brand-orange-50 px-3 py-2 text-xs text-brand-orange-800">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>KYC Required: ID card (CNIC) verification is required for Cash on Delivery orders. Please upload your ID card below.</span>
                </div>
              </div>
            )}

            {/* KYC notice for non-card, non-COD */}
            {needsKyc && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-orange-50 px-3 py-2 text-xs text-brand-orange-800">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>KYC Required: As per government regulations, sending money via {paymentMethod === 'bank_transfer' ? 'bank transfer' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} requires ID card (CNIC) verification. Please upload your ID card below.</span>
              </div>
            )}
          </div>

          {/* KYC ID Card Upload — shown for easypaisa, jazzcash, bank_transfer, cod */}
          {(needsKyc || isCod) && (
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <IdCard size={20} className="text-brand-green-600" />
                <h2 className="text-lg font-bold text-gray-900">KYC Verification — ID Card Upload</h2>
              </div>
              <p className="mb-4 text-sm text-gray-500">
                Please upload a clear photo of your CNIC (National ID Card). This is required for KYC verification before your order can be processed.
              </p>

              {!idCardPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-brand-green-500 hover:bg-brand-green-50"
                >
                  <Upload size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Click to upload your ID card</p>
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG, or PDF — max 5MB</p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-brand-green-200 bg-brand-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-green-100">
                      <FileCheck2 size={24} className="text-brand-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {idCardFile?.name}
                      </p>
                      <p className="text-xs text-brand-green-700">ID card uploaded successfully</p>
                    </div>
                    {idCardPreview.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img
                        src={idCardPreview}
                        alt="ID card preview"
                        className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={clearFile}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-red-600"
                    >
                      <AlertCircle size={18} />
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 text-sm">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1 font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatPKR(item.product.price)}
                    </p>
                  </div>
                  <span className="font-medium text-gray-700">
                    {formatPKR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPKR(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-brand-green-600">
                  {baseDeliveryFee === 0 ? 'FREE' : formatPKR(baseDeliveryFee)}
                </span>
              </div>
              {isCod && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">COD Surcharge (6%)</span>
                    <span className="font-medium text-brand-orange-600">
                      {formatPKR(codSurcharge)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Government Tax (2%)</span>
                    <span className="font-medium text-brand-orange-600">
                      {formatPKR(govtTax)}
                    </span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-brand-green-700">
                    {formatPKR(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-brand-red-50 px-3 py-2 text-sm text-brand-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || uploading} className="btn-primary mt-6 w-full">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploading ? 'Uploading ID...' : 'Placing Order...'}
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} />
              Secure checkout
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[#25D366] hover:underline"
            >
              <MessageCircle size={14} />
              Need help? Chat on WhatsApp
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
