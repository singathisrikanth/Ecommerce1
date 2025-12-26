
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Store as StoreIcon, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRightLeft,
  Trash2,
  Edit,
  Power,
  Layers,
  Globe,
  Home,
  Key,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  History,
  CreditCard,
  Box
} from 'lucide-react';
import { Product, Store, ProductStatus, Order } from './types';

// Helper to get relative dates for mock data
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getRelativeDate = (days: number) => {
  const d = new Date();
  d.setDate(today.getDate() + days);
  return formatDate(d);
};

export const INITIAL_STORES: Store[] = [
  { id: 'st_001', name: 'New York Flagship', location: 'Manhattan, NY', type: 'RETAIL', ownership: 'OWN' },
  { id: 'st_002', name: 'London Central', location: 'Westminster, UK', type: 'RETAIL', ownership: 'OWN' },
  { id: 'st_003', name: 'Amazon Global Fulfillment', location: 'Cloud', type: 'ONLINE', ownership: 'MARKETPLACE', credentials: { apiKey: 'AMZ-***-92', apiSecret: '************' } },
  { id: 'st_004', name: 'Berlin Hub', location: 'Berlin, DE', type: 'WAREHOUSE', ownership: 'OWN' },
  { id: 'st_005', name: 'Shopify Store (Direct)', location: 'Online', type: 'ONLINE', ownership: 'OWN' },
  { id: 'st_006', name: 'eBay Marketplace', location: 'Global', type: 'ONLINE', ownership: 'MARKETPLACE', credentials: { apiKey: 'EBY-***-11', apiSecret: '************' } },
];

export const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ord_101', 
    externalId: '3810', 
    storeId: 'st_005', 
    customer: 'Alice Smith', 
    customerEmail: 'alice@example.com',
    customerAddress: '123 Maple Ave, Springfield, IL 62704',
    date: getRelativeDate(-1), 
    shipBy: getRelativeDate(0), // Due Today
    subtotal: 100.00,
    tax: 15.00,
    discount: 5.21,
    total: 119.79, 
    itemCount: 2, 
    status: 'PAID', 
    packingType: 'Standard Box',
    items: [
      { id: 'oi_1', productId: 'prod_9k2m1', sku: 'EL-LPT-01-SLV', name: 'Zenith Pro Laptop (14")', quantity: 1, price: 100.00 }
    ],
    history: [
      { timestamp: new Date().toISOString(), action: 'Order Created', user: 'System' },
      { timestamp: new Date().toISOString(), action: 'Payment Confirmed', user: 'Payment Gateway' }
    ]
  },
  { 
    id: 'ord_102', 
    externalId: '3811', 
    storeId: 'st_003', 
    customer: 'Bob Jones', 
    customerEmail: 'bob.j@provider.net',
    customerAddress: '456 Oak St, Seattle, WA 98101',
    date: getRelativeDate(-1), 
    shipBy: getRelativeDate(1), // Due Tomorrow (Warning)
    subtotal: 50.00,
    tax: 4.20,
    discount: 0,
    total: 54.20, 
    itemCount: 2, 
    status: 'PENDING',
    packingType: 'Polybag',
    items: [
      { id: 'oi_2', productId: 'prod_5n3x9', sku: 'HM-CHR-42', name: 'ErgoSoft Office Chair', quantity: 2, price: 25.00 }
    ],
    history: [
      { timestamp: getRelativeDate(-1) + 'T14:30:00Z', action: 'Order Imported from Amazon', user: 'Amazon Sync' }
    ]
  },
  { 
    id: 'ord_103', 
    externalId: '3812', 
    storeId: 'st_005', 
    customer: 'Charlie Brown', 
    customerEmail: 'charlie@peanuts.com',
    customerAddress: '789 Pine Rd, Minneapolis, MN 55401',
    date: getRelativeDate(-45), 
    shipBy: getRelativeDate(-42), // Overdue
    subtotal: 200.00,
    tax: 18.00,
    discount: 10.00,
    total: 208.00, 
    itemCount: 1, 
    status: 'SHIPPED',
    packingType: 'Large Crate',
    items: [
      { id: 'oi_3', productId: 'prod_9k2m1', sku: 'EL-LPT-01-GRY', name: 'Zenith Pro Laptop (16")', quantity: 1, price: 200.00 }
    ],
    history: [
      { timestamp: getRelativeDate(-45) + 'T10:00:00Z', action: 'Order Shipped', user: 'Logistics' }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_9k2m1',
    sku: 'EL-LPT-01',
    name: 'Zenith Pro Laptop',
    category: 'Electronics',
    description: 'High-performance laptop for professionals.',
    basePrice: 1299.99,
    status: ProductStatus.ACTIVE,
    variants: [
      { id: 'v_1', sku: 'EL-LPT-01-SLV', size: '14"', color: 'Silver', priceAdjustment: 0 },
      { id: 'v_2', sku: 'EL-LPT-01-GRY', size: '16"', color: 'Space Gray', priceAdjustment: 200 }
    ],
    createdAt: '2023-10-15T10:30:00Z',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
    mappings: [
      { storeId: 'st_001', spid: 'NY-ZEN-101', price: 1299.99, stock: 50, enabled: true, variantMappings: [] },
      { storeId: 'st_003', spid: 'AMZ-B07X-LPT', price: 1249.99, stock: 500, enabled: true, variantMappings: [] },
    ]
  },
  {
    id: 'prod_5n3x9',
    sku: 'HM-CHR-42',
    name: 'ErgoSoft Office Chair',
    category: 'Home & Office',
    description: 'Ergonomic office chair with lumbar support.',
    basePrice: 299.50,
    status: ProductStatus.ACTIVE,
    variants: [],
    createdAt: '2023-11-02T14:15:00Z',
    images: ['https://images.unsplash.com/photo-1505797149-43b007662c21?w=500', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500'],
    mappings: [
      { storeId: 'st_001', spid: 'NY-ERG-500', price: 310.00, stock: 12, enabled: true, variantMappings: [] },
      { storeId: 'st_004', spid: 'BER-ERG-42', price: 290.00, stock: 100, enabled: true, variantMappings: [] },
    ]
  }
];

export const CATEGORIES = ['Electronics', 'Home & Office', 'Apparel', 'Books', 'Health & Beauty'];

export const ICONS = {
  Dashboard: LayoutDashboard,
  Products: Package,
  Stores: StoreIcon,
  Orders: ShoppingBag,
  Settings: Settings,
  Plus: Plus,
  Search: Search,
  Filter: Filter,
  More: MoreVertical,
  Check: CheckCircle2,
  X: X,
  Warning: AlertCircle,
  Map: HeaderIcon,
  Delete: Trash2,
  Edit: Edit,
  Power: Power,
  Variants: Layers,
  Marketplace: Globe,
  OwnStore: Home,
  Key: Key,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  Back: ArrowLeft,
  User: User,
  Mail: Mail,
  MapPin: MapPin,
  Calendar: Calendar,
  History: History,
  Financials: CreditCard,
  Packing: Box
};

function HeaderIcon(props: any) { return <ArrowRightLeft {...props} />; }
