import type { LocalizedString } from '@/lib/localized';

export type ProductCategory =
  | 'Cà phê'
  | 'Trà'
  | 'Nước ép'
  | 'Sinh tố'
  | 'Nước giải khát'
  | 'Đồ uống có cồn nhẹ';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface NutritionInfo {
  [key: string]: number | undefined;
}

export interface ProductSize {
  label: string;
  volumeMl: number;
  priceExtra: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: Address;
  isActive?: boolean;
}

export interface Product {
  _id: string;
  name: LocalizedString | string;
  description: LocalizedString | string;
  category: ProductCategory;
  volumeMl: number;
  sizes?: ProductSize[];
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  nutrition: NutritionInfo | Record<string, number>;
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
  tags?: string[];
  soldCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sizeLabel?: string;
  volumeMl?: number;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliverySlot: string;
  expectedDeliveryAt?: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount?: number;
  couponCode?: string;
  note?: string;
  total: number;
  paidAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string } | string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  /** productId::sizeLabel — nhận diện dòng giỏ */
  lineId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  sizeLabel: string;
  volumeMl: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStats {
  revenue: number;
  orderCount: number;
  avgOrderValue?: number;
  totalUsers: number;
  lowStock: Product[];
  topProducts: {
    _id: string;
    name: LocalizedString | string;
    image: string;
    sold: number;
    revenue: number;
  }[];
  statusBreakdown?: Record<string, number>;
  recentOrders?: Order[];
}

export interface Coupon {
  _id: string;
  code: string;
  description: LocalizedString | string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Cà phê',
  'Trà',
  'Nước ép',
  'Sinh tố',
  'Nước giải khát',
  'Đồ uống có cồn nhẹ',
];

export const DELIVERY_SLOTS = [
  'Trong 1 giờ',
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  '18:00 – 20:00',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};
