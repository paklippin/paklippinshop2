export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card' | 'cod';

export type PaymentStatus = 'unpaid' | 'paid';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  is_pos_order: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  kyc_document_url: string | null;
  cod_surcharge: number;
  delivery_fee: number;
  govt_tax: number;
  cod_delivery_paid: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: OrderStatus | string;
  note: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  image_url: string;
  stock: number;
  quantity: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  card: 'Debit/Credit Card',
  cod: 'Cash on Delivery',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export function formatPKR(amount: number): string {
  return 'Rs ' + amount.toLocaleString('en-PK');
}
