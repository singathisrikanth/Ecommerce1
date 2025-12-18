
import React, { useState, useMemo } from 'react';
import { ViewType, Product, Store, ProductStatus, StoreMapping } from './types';
import { INITIAL_PRODUCTS, INITIAL_STORES, ICONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StoreMappingModal from './components/StoreMappingModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stores] = useState<Store[]>(INITIAL_STORES);
  
  // UI States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mappingProduct, setMappingProduct] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddProduct = (newProduct: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts(prev => [...prev, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product? All store mappings will be lost.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateMappings = (productId: string, mappings: StoreMapping[]) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, mappings } : p
    ));
    setIsMappingModalOpen(false);
    setMappingProduct(null);
  };

  const handleToggleMapping = (productId: string, storeId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        mappings: p.mappings.map(m => 
          m.storeId === storeId ? { ...m, enabled: !m.enabled } : m
        )
      };
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {currentView.charAt(0) + currentView.slice(1).toLowerCase()}
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
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {currentView === 'DASHBOARD' && (
            <Dashboard products={products} stores={stores} />
          )}

          {currentView === 'PRODUCTS' && (
            <ProductList 
              products={filteredProducts} 
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

          {currentView === 'STORES' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-6">Connected Stores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map(store => (
                  <div key={store.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <ICONS.Stores className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{store.name}</h3>
                        <p className="text-xs text-gray-500">{store.id}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Location: {store.location}</p>
                      <p>Type: <span className="text-blue-600 font-medium">{store.type}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductForm 
          onSave={handleAddProduct} 
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }} 
          initialData={editingProduct || undefined}
        />
      )}

      {isMappingModalOpen && mappingProduct && (
        <StoreMappingModal 
          product={mappingProduct}
          stores={stores}
          onSave={handleUpdateMappings}
          onClose={() => {
            setIsMappingModalOpen(false);
            setMappingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
