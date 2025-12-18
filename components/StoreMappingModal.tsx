
import React, { useState } from 'react';
import { Product, Store, StoreMapping } from '../types';
import { ICONS } from '../constants';

interface StoreMappingModalProps {
  product: Product;
  stores: Store[];
  onSave: (productId: string, mappings: StoreMapping[]) => void;
  onClose: () => void;
}

const StoreMappingModal: React.FC<StoreMappingModalProps> = ({ product, stores, onSave, onClose }) => {
  const [mappings, setMappings] = useState<StoreMapping[]>([...product.mappings]);

  const generateSPID = (storeId: string) => {
    const storeCode = storeId.split('_')[1] || storeId.substring(0, 3).toUpperCase();
    const productSlug = (product.sku || product.id).split('-')[0];
    return `${storeCode}-${productSlug}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  };

  const handleToggleStore = (storeId: string) => {
    const exists = mappings.find(m => m.storeId === storeId);
    if (exists) {
      setMappings(prev => prev.filter(m => m.storeId !== storeId));
    } else {
      setMappings(prev => [...prev, {
        storeId,
        spid: generateSPID(storeId),
        price: product.basePrice,
        stock: 0,
        enabled: true
      }]);
    }
  };

  const handleUpdateMapping = (storeId: string, updates: Partial<StoreMapping>) => {
    setMappings(prev => prev.map(m => m.storeId === storeId ? { ...m, ...updates } : m));
  };

  const handleRegenerateSPID = (storeId: string) => {
    handleUpdateMapping(storeId, { spid: generateSPID(storeId) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Store Mappings</h2>
            <p className="text-sm text-gray-500">{product.name} ({product.sku})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Store Selection */}
          <div className="w-full md:w-1/3 border-r border-gray-100 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Stores</h3>
            <div className="space-y-2">
              {stores.map(store => {
                const isMapped = mappings.some(m => m.storeId === store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => handleToggleStore(store.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isMapped ? 'bg-white border-blue-200 shadow-sm ring-2 ring-blue-50' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isMapped ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <ICONS.Stores className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{store.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{store.type}</p>
                    </div>
                    {isMapped && <ICONS.Check className="w-4 h-4 text-blue-600 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mapping Configuration */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {mappings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ICONS.Map className="w-12 h-12 opacity-20" />
                <p className="text-center italic text-sm">Select a store from the panel to create a mapping.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {mappings.map(mapping => {
                  const store = stores.find(s => s.id === mapping.storeId);
                  return (
                    <div key={mapping.storeId} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{store?.name}</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-mono">{mapping.storeId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${mapping.enabled ? 'text-green-600' : 'text-red-500'}`}>
                            {mapping.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button 
                            onClick={() => handleUpdateMapping(mapping.storeId, { enabled: !mapping.enabled })}
                            className={`w-8 h-4 rounded-full relative transition-colors ${mapping.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${mapping.enabled ? 'left-4.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store Product ID (Auto)</label>
                            <button 
                              onClick={() => handleRegenerateSPID(mapping.storeId)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                              title="Regenerate ID"
                            >
                              Reset
                            </button>
                          </div>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            value={mapping.spid}
                            onChange={e => handleUpdateMapping(mapping.storeId, { spid: e.target.value.toUpperCase() })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Store Price ($)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            value={mapping.price}
                            onChange={e => handleUpdateMapping(mapping.storeId, { price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            value={mapping.stock}
                            onChange={e => handleUpdateMapping(mapping.storeId, { stock: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-700 font-semibold">Cancel</button>
          <button 
            onClick={() => onSave(product.id, mappings)}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            Update Mappings
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreMappingModal;
