
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  lastActive?: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: 'n8n' | 'WEBHOOK';
  endpoint: string;
  schedule: 'REALTIME' | 'HOURLY' | 'DAILY' | 'MANUAL';
  lastRun?: string;
  status: 'SUCCESS' | 'FAILED' | 'IDLE' | 'RUNNING';
}

export interface StoreCredentials {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  type: 'RETAIL' | 'WAREHOUSE' | 'ONLINE';
  ownership: 'OWN' | 'MARKETPLACE';
  credentials?: StoreCredentials;
}

export interface StoreVariantMapping {
  variantId: string;
  spid: string;
  price: number;
  stock: number;
}

export interface StoreMapping {
  storeId: string;
  spid: string;
  price: number;
  stock: number;
  enabled: boolean;
  variantMappings: StoreVariantMapping[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  status: ProductStatus;
  variants: ProductVariant[];
  mappings: StoreMapping[];
  images: string[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
}

export interface Order {
  id: string;
  externalId: string;
  storeId: string;
  customer: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  shipBy?: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  itemCount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  packingType: string;
  trackingNumber?: string;
  fulfilledOnSource?: boolean;
  items: OrderItem[];
  history: AuditLogEntry[];
}

export type ViewType = 'DASHBOARD' | 'PRODUCTS' | 'PRODUCT_DETAIL' | 'STORES' | 'ORDERS' | 'ORDER_DETAIL' | 'SETTINGS';
