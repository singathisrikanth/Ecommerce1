
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
  Power
} from 'lucide-react';
import { Product, Store, ProductStatus } from './types';

export const INITIAL_STORES: Store[] = [
  { id: 'st_001', name: 'New York Flagship', location: 'Manhattan, NY', type: 'RETAIL' },
  { id: 'st_002', name: 'London Central', location: 'Westminster, UK', type: 'RETAIL' },
  { id: 'st_003', name: 'Amazon Global Fulfillment', location: 'Cloud', type: 'ONLINE' },
  { id: 'st_004', name: 'Berlin Hub', location: 'Berlin, DE', type: 'WAREHOUSE' },
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
    createdAt: '2023-10-15T10:30:00Z',
    mappings: [
      { storeId: 'st_001', spid: 'NY-ZEN-101', price: 1299.99, stock: 50, enabled: true },
      { storeId: 'st_003', spid: 'AMZ-B07X-LPT', price: 1249.99, stock: 500, enabled: true },
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
    createdAt: '2023-11-02T14:15:00Z',
    mappings: [
      { storeId: 'st_001', spid: 'NY-ERG-500', price: 310.00, stock: 12, enabled: true },
      { storeId: 'st_004', spid: 'BER-ERG-42', price: 290.00, stock: 100, enabled: true },
    ]
  }
];

export const CATEGORIES = ['Electronics', 'Home & Office', 'Apparel', 'Books', 'Health & Beauty'];

export const ICONS = {
  Dashboard: LayoutDashboard,
  Products: Package,
  Stores: StoreIcon,
  Settings: Settings,
  Plus: Plus,
  Search: Search,
  Filter: Filter,
  More: MoreVertical,
  Check: CheckCircle2,
  X: XCircle,
  Warning: AlertCircle,
  Map: ArrowRightLeft,
  Delete: Trash2,
  Edit: Edit,
  Power: Power
};
