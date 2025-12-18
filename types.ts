
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

export interface Store {
  id: string;
  name: string;
  location: string;
  type: 'RETAIL' | 'WAREHOUSE' | 'ONLINE';
}

export interface StoreMapping {
  storeId: string;
  spid: string; // Store Specific Product ID
  price: number;
  stock: number;
  enabled: boolean;
}

export interface Product {
  id: string; // Global Product ID
  sku: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  status: ProductStatus;
  mappings: StoreMapping[];
  createdAt: string;
}

export type ViewType = 'DASHBOARD' | 'PRODUCTS' | 'STORES' | 'SETTINGS';
