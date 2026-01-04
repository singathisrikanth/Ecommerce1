
import React, { useState, useMemo } from 'react';
import { ViewType, Product, Store, ProductStatus, StoreMapping, StoreVariantMapping, Order, OrderItem } from './types';
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
import Login from './components/Login';
import { Menu, X } from 'lucide-react';

export type TimeRange = 'ALL' | 'TODAY' | 'TOMORROW' | 'DELAYED' | '30D' | '90D' | '180D' | '365D';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  
  const [orderTimeRange, setOrderTimeRange] = useState<TimeRange>('ALL');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [mappingProduct, setMappingProduct] = useState<Product | null>(null);
  
  const [storeFilter, setStoreFilter] = useState<'ALL' | 'OWN' | 'MARKETPLACE'>('ALL');
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

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleCombineOrders = (orderIds: string[]) => {
    const selected = orders.filter(o => orderIds.includes(o.id));
    if (selected.length < 2) return;

    // Check if they are compatible (same customer/email)
    const first = selected[0];
    const isCompatible = selected.every(o => o.customerEmail === first.customerEmail);

    if (!isCompatible) {
      alert("Cannot combine: Orders must belong to the same customer email.");
      return;
    }

    const mergedItems: OrderItem[] = selected.flatMap(o => o.items).reduce((acc: OrderItem[], item) => {
      const existing = acc.find(i => i.sku === item.sku);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    const masterId = `ord_merged_${Math.random().toString(36).substring(2, 6)}`;
    const combinedOrder: Order = {
      id: masterId,
      externalId: selected.map(o => o.externalId).join('+'),
      storeId: 'st_multi',
      customer: first.customer,
      customerEmail: first.customerEmail,
      customerAddress: first.customerAddress,
      date: new Date().toISOString(),
      shipBy: selected.find(o => o.shipBy)?.shipBy,
      total: selected.reduce((sum, o) => sum + o.total, 0),
      subtotal: selected.reduce((sum, o) => sum + o.subtotal, 0),
      tax: selected.reduce((sum, o) => sum + o.tax, 0),
      discount: selected.reduce((sum, o) => sum + o.discount, 0),
      itemCount: mergedItems.reduce((sum, i) => sum + i.quantity, 0),
      status: 'PAID',
      packingType: 'Combined Large Box',
      isCombined: true,
      sourceOrderIds: orderIds,
      items: mergedItems,
      history: [
        { timestamp: new Date().toISOString(), action: `Combined from ${selected.length} source orders`, user: 'srikanth varma' },
        ...selected.flatMap(o => o.history)
      ]
    };

    setOrders(prev => [combinedOrder, ...prev.filter(o => !orderIds.includes(o.id))]);
    alert(`Success: ${selected.length} orders merged into single shipment ${masterId}`);
  };

  const handleImportMarketplaceOrders = async () => {
    // Simulated smart import logic
    const newOrders: Order[] = [
      {
        id: `ord_imp_${Math.random().toString(36).substring(2, 6)}`,
        externalId: 'AMZ-5521',
        storeId: 'st_003',
        customer: 'Alice Smith',
        customerEmail: 'alice@example.com',
        customerAddress: '123 Maple Ave, Springfield, IL 62704',
        date: new Date().toISOString(),
        shipBy: new Date().toISOString(),
        total: 45.00,
        subtotal: 40.00,
        tax: 5.00,
        discount: 0,
        itemCount: 1,
        status: 'PAID',
        packingType: 'Standard Box',
        items: [{ id: 'oi_imp1', productId: 'prod_9k2m1', sku: 'EL-LPT-01-SLV', name: 'Laptop Stand', quantity: 1, price: 40.00 }],
        history: [{ timestamp: new Date().toISOString(), action: 'Imported from Amazon', user: 'System Sync' }]
      }
    ];

    setOrders(prev => [...newOrders, ...prev]);
    
    // Auto-detect consolidation potential
    const existingForAlice = orders.find(o => o.customerEmail === 'alice@example.com' && o.status !== 'SHIPPED');
    if (existingForAlice) {
      setTimeout(() => {
        if (confirm(`Consolidation detected! New order AMZ-5521 can be combined with existing order for Alice Smith. Combine now?`)) {
           handleCombineOrders([existingForAlice.id, newOrders[0].id]);
        }
      }, 500);
    }
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
    setIsSidebarOpen(false); // Auto-close on mobile
    if (view !== 'ORDER_DETAIL') setSelectedOrder(null);
    if (view !== 'PRODUCT_DETAIL') setSelectedProduct(null);
    if (view === 'ORDERS' && currentView !== 'DASHBOARD') setOrderTimeRange('ALL');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        onLogout={() => setIsLoggedIn(false)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
              {currentView === 'ORDER_DETAIL' ? `Order: ${selectedOrder?.externalId}` : 
               currentView === 'PRODUCT_DETAIL' ? `Product: ${selectedProduct?.sku}` :
               currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_detail', ' Details')}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
             {currentView === 'ORDERS' && (
               <button 
                onClick={handleImportMarketplaceOrders}
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors shadow-sm"
              >
                <ICONS.Import className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
             )}
             {currentView === 'STORES' ? (
               <button 
                onClick={() => { setEditingStore(null); setIsStoreModalOpen(true); }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors shadow-sm"
              >
                <ICONS.Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Connect</span>
              </button>
             ) : (currentView === 'PRODUCTS' || currentView === 'DASHBOARD') ? (
               <button 
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors shadow-sm"
              >
                <ICONS.Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">New Product</span>
              </button>
             ) : null}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
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
              onCombineOrders={handleCombineOrders}
              initialTimeRange={orderTimeRange}
            />
          )}

          {currentView === 'ORDER_DETAIL' && selectedOrder && (
            <OrderDetail 
              order={selectedOrder} 
              stores={stores} 
              orders={orders}
              onBack={() => setCurrentView('ORDERS')} 
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {currentView === 'PRODUCTS' && (
            <ProductList 
              products={filteredProducts} 
              stores={stores}
              onViewProduct={handleViewProduct}
              onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
              onDelete={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
              onMap={(p) => { setMappingProduct(p); setIsMappingModalOpen(true); }}
              onToggleMapping={(pid, sid) => {}}
            />
          )}

          {currentView === 'PRODUCT_DETAIL' && selectedProduct && (
            <ProductDetail 
              product={selectedProduct}
              stores={stores}
              onBack={() => setCurrentView('PRODUCTS')}
              onEdit={() => { setEditingProduct(selectedProduct); setIsProductModalOpen(true); }}
              onMap={() => { setMappingProduct(selectedProduct); setIsMappingModalOpen(true); }}
              onUpdateProduct={handleUpdateProduct}
              onToggleMapping={(storeId) => {}}
            />
          )}

          {currentView === 'STORES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map(store => (
                <div key={store.id} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
                   <h3 className="text-lg font-bold">{store.name}</h3>
                   <p className="text-sm text-gray-500">{store.location}</p>
                </div>
              ))}
            </div>
          )}

          {currentView === 'SETTINGS' && (
            <Settings onLogout={() => setIsLoggedIn(false)} />
          )}
        </div>
      </main>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductForm onSave={(p) => { setProducts(prev => [...prev, p]); setIsProductModalOpen(false); }} onClose={() => setIsProductModalOpen(false)} initialData={editingProduct || undefined} />
      )}
    </div>
  );
};

export default App;
