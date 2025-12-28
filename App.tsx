
import React, { useState, useMemo } from 'react';
import { ViewType, Product, Store, ProductStatus, StoreMapping, StoreVariantMapping, Order } from './types';
import { INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_ORDERS, ICONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StoreForm from './components/StoreForm';
import StoreMappingModal from './components/StoreMappingModal';
import Orders from './components/Orders';
import OrderDetail from './components/OrderDetail';
import Settings from './components/Settings';
import ProductDetail from './components/ProductDetail';

// Define the TimeRange type here to ensure consistency
export type TimeRange = 'ALL' | 'TODAY' | 'TOMORROW' | 'DELAYED' | '30D' | '90D' | '180D' | '365D';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS.map(p => ({
    ...p,
    mappings: p.mappings.map(m => ({
      ...m,
      variantMappings: p.variants.map(v => ({
        variantId: v.id,
        spid: `${m.spid}-${v.sku.split('-').pop()}`,
        price: m.price + v.priceAdjustment,
        stock: Math.floor(m.stock / (p.variants.length || 1))
      }))
    }))
  })));
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Orders View filter state - lifted to allow control from Dashboard
  const [orderTimeRange, setOrderTimeRange] = useState<TimeRange>('ALL');
  
  // UI States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [mappingProduct, setMappingProduct] = useState<Product | null>(null);
  
  const [storeFilter, setStoreFilter] = useState<'ALL' | 'OWN' | 'MARKETPLACE'>('ALL');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const filteredStores = useMemo(() => {
    let list = stores;
    if (storeFilter !== 'ALL') {
      list = list.filter(s => s.ownership === storeFilter);
    }
    if (searchQuery) {
      list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [stores, storeFilter, searchQuery]);

  const generateSPID = (storeId: string, productSku: string, productId: string, variantSku?: string) => {
    const storeCode = storeId.split('_')[1] || storeId.substring(0, 3).toUpperCase();
    const productPart = variantSku || productSku || productId.substring(0, 5);
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${storeCode}-${productPart}-${suffix}`;
  };

  const handleAddProduct = (newProduct: Product) => {
    if (editingProduct || selectedProduct) {
      setProducts(prev => prev.map(p => p.id === (editingProduct?.id || selectedProduct?.id) ? newProduct : p));
      if (selectedProduct?.id === newProduct.id) {
        setSelectedProduct(newProduct);
      }
    } else {
      const automatedMappings: StoreMapping[] = stores.map(store => {
        const baseSpid = generateSPID(store.id, newProduct.sku, newProduct.id);
        const variantMappings: StoreVariantMapping[] = newProduct.variants.map(variant => ({
          variantId: variant.id,
          spid: generateSPID(store.id, variant.sku, newProduct.id),
          price: newProduct.basePrice + variant.priceAdjustment,
          stock: 1000 
        }));

        return {
          storeId: store.id,
          spid: baseSpid,
          price: newProduct.basePrice,
          stock: variantMappings.length > 0 ? variantMappings.reduce((sum, vm) => sum + vm.stock, 0) : 1000,
          enabled: true,
          variantMappings
        };
      });

      const productWithMappings = { ...newProduct, mappings: automatedMappings };
      setProducts(prev => [...prev, productWithMappings]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddStore = (newStore: Store) => {
    if (editingStore) {
      setStores(prev => prev.map(s => s.id === editingStore.id ? newStore : s));
    } else {
      setStores(prev => [...prev, newStore]);
    }
    setIsStoreModalOpen(false);
    setEditingStore(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product? All store mappings will be lost.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setCurrentView('PRODUCTS');
        setSelectedProduct(null);
      }
    }
  };

  const handleUpdateMappings = (productId: string, mappings: StoreMapping[]) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const updated = { ...p, mappings };
      if (selectedProduct?.id === productId) {
        setSelectedProduct(updated);
      }
      return updated;
    }));
    setIsMappingModalOpen(false);
    setMappingProduct(null);
  };

  const handleToggleMapping = (productId: string, storeId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const updated = {
        ...p,
        mappings: p.mappings.map(m => m.storeId === storeId ? { ...m, enabled: !m.enabled } : m)
      };
      if (selectedProduct?.id === productId) {
        setSelectedProduct(updated);
      }
      return updated;
    }));
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('ORDER_DETAIL');
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('PRODUCT_DETAIL');
  };

  const handleNavigateToOrders = (range: TimeRange) => {
    setOrderTimeRange(range);
    setCurrentView('ORDERS');
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'ORDER_DETAIL') {
      setSelectedOrder(null);
    }
    if (view !== 'PRODUCT_DETAIL') {
      setSelectedProduct(null);
    }
    // If manually navigating to orders, default to ALL unless set via dashboard
    if (view === 'ORDERS' && currentView !== 'DASHBOARD') {
      setOrderTimeRange('ALL');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {currentView === 'ORDER_DETAIL' ? `Order Details: ${selectedOrder?.externalId}` : 
               currentView === 'PRODUCT_DETAIL' ? `Product Details: ${selectedProduct?.sku}` :
               currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_detail', ' Details')}
            </h1>
            <div className="hidden md:flex relative">
              <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search globally..." 
                className="pl-10 pr-4 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {currentView === 'STORES' ? (
               <button 
                onClick={() => {
                  setEditingStore(null);
                  setIsStoreModalOpen(true);
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ICONS.Plus className="w-4 h-4" />
                Connect Store
              </button>
             ) : (currentView === 'PRODUCTS' || currentView === 'DASHBOARD') ? (
               <button 
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ICONS.Plus className="w-4 h-4" />
                New Product
              </button>
             ) : null}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {currentView === 'DASHBOARD' && (
            <Dashboard 
              products={products} 
              stores={stores} 
              orders={orders} 
              onUpdateOrder={handleUpdateOrder} 
              onNavigateWithFilter={handleNavigateToOrders}
              onViewChange={handleViewChange}
            />
          )}

          {currentView === 'ORDERS' && (
            <Orders 
              stores={stores} 
              orders={orders} 
              onViewOrder={handleViewOrder} 
              onUpdateOrder={handleUpdateOrder}
              initialTimeRange={orderTimeRange}
            />
          )}

          {currentView === 'ORDER_DETAIL' && selectedOrder && (
            <OrderDetail 
              order={selectedOrder} 
              stores={stores} 
              onBack={() => setCurrentView('ORDERS')} 
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {currentView === 'PRODUCTS' && (
            <ProductList 
              products={filteredProducts} 
              stores={stores}
              onViewProduct={handleViewProduct}
              onEdit={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
              onMap={(p) => {
                setMappingProduct(p);
                setIsMappingModalOpen(true);
              }}
              onToggleMapping={handleToggleMapping}
            />
          )}

          {currentView === 'PRODUCT_DETAIL' && selectedProduct && (
            <ProductDetail 
              product={selectedProduct}
              stores={stores}
              onBack={() => setCurrentView('PRODUCTS')}
              onEdit={() => {
                setEditingProduct(selectedProduct);
                setIsProductModalOpen(true);
              }}
              onMap={() => {
                setMappingProduct(selectedProduct);
                setIsMappingModalOpen(true);
              }}
              onToggleMapping={(storeId) => handleToggleMapping(selectedProduct.id, storeId)}
            />
          )}

          {currentView === 'STORES' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="bg-white p-1 rounded-xl border border-gray-200 inline-flex shadow-sm self-start">
                  <button onClick={() => setStoreFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${storeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>All Stores</button>
                  <button onClick={() => setStoreFilter('OWN')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${storeFilter === 'OWN' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><ICONS.OwnStore className="w-3.5 h-3.5" />Own Stores</button>
                  <button onClick={() => setStoreFilter('MARKETPLACE')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${storeFilter === 'MARKETPLACE' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><ICONS.Marketplace className="w-3.5 h-3.5" />Marketplaces</button>
                </div>
                <p className="text-sm text-gray-500 font-medium">Showing {filteredStores.length} storefronts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {filteredStores.map(store => (
                  <div key={store.id} className="bg-white p-5 border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all group shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl transition-colors ${store.ownership === 'MARKETPLACE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {store.ownership === 'MARKETPLACE' ? <ICONS.Marketplace className="w-6 h-6" /> : <ICONS.OwnStore className="w-6 h-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                           {store.ownership === 'MARKETPLACE' && store.credentials?.apiKey && (
                             <div className="p-1.5 bg-green-50 text-green-600 rounded-lg" title="API Integrated"><ICONS.Key className="w-3.5 h-3.5" /></div>
                           )}
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${store.ownership === 'MARKETPLACE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{store.ownership}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{store.name}</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500"><ICONS.Map className="w-3.5 h-3.5" /><span>{store.location}</span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-500"><ICONS.Search className="w-3.5 h-3.5" /><span>Type: <span className="text-gray-900 font-medium">{store.type}</span></span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-500"><ICONS.Products className="w-3.5 h-3.5" /><span>ID: <span className="font-mono">{store.id}</span></span></div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-bold text-gray-600">Active</span></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingStore(store); setIsStoreModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><ICONS.Edit className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => { setEditingStore(null); setIsStoreModalOpen(true); }} className="p-5 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all min-h-[220px]">
                  <div className="p-3 bg-gray-50 rounded-full"><ICONS.Plus className="w-8 h-8" /></div>
                  <span className="font-bold text-sm">Add Storefront</span>
                </button>
              </div>
            </div>
          )}

          {currentView === 'SETTINGS' && (
            <Settings />
          )}
        </div>
      </main>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductForm onSave={handleAddProduct} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} initialData={editingProduct || undefined} />
      )}
      {isStoreModalOpen && (
        <StoreForm onSave={handleAddStore} onClose={() => { setIsStoreModalOpen(false); setEditingStore(null); }} initialData={editingStore || undefined} />
      )}
      {isMappingModalOpen && mappingProduct && (
        <StoreMappingModal product={mappingProduct} stores={stores} onSave={handleUpdateMappings} onClose={() => { setIsMappingModalOpen(false); setMappingProduct(null); }} />
      )}
    </div>
  );
};

export default App;
