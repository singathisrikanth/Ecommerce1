
import React, { useState } from 'react';
import { Product, Store, StoreMapping, StoreVariantMapping } from '../types';
import { ICONS } from '../constants';

interface StoreMappingModalProps {
  product: Product;
  stores: Store[];
  onSave: (productId: string, mappings: StoreMapping[]) => void;
  onClose: () => void;
}

const StoreMappingModal: React.FC<StoreMappingModalProps> = ({ product, stores, onSave, onClose }) => {
  const [mappings, setMappings] = useState<StoreMapping[]>([...product.mappings]);

  const generateSPID = (storeId: string, suffix?: string) => {
    const storeCode = storeId.split('_')[1] || storeId.substring(0, 3).toUpperCase();
    const productSlug = (product.sku || product.id).split('-')[0];
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${storeCode}-${productSlug}${suffix ? '-' + suffix : ''}-${rand}`;
  };

  const handleToggleStore = (storeId: string) => {
    const exists = mappings.find(m => m.storeId === storeId);
    if (exists) {
      setMappings(prev => prev.filter(m => m.storeId !== storeId));
    } else {
      const variantMappings: StoreVariantMapping[] = product.variants.map(v => ({
        variantId: v.id,
        spid: generateSPID(storeId, v.sku.split('-').pop()),
        price: product.basePrice + v.priceAdjustment,
        stock: 1000
      }));

      setMappings(prev => [...prev, {
        storeId,
        spid: generateSPID(storeId),
        price: product.basePrice,
        stock: variantMappings.length > 0 ? variantMappings.reduce((s, vm) => s + vm.stock, 0) : 1000,
        enabled: true,
        variantMappings
      }]);
    }
  };

  const handleUpdateMapping = (storeId: string, updates: Partial<StoreMapping>) => {
    setMappings(prev => prev.map(m => m.storeId === storeId ? { ...m, ...updates } : m));
  };

  const handleUpdateVariantMapping = (storeId: string, variantId: string, updates: Partial<StoreVariantMapping>) => {
    setMappings(prev => prev.map(m => {
      if (m.storeId !== storeId) return m;
      const updatedVariantMappings = m.variantMappings.map(vm => 
        vm.variantId === variantId ? { ...vm, ...updates } : vm
      );
      // Recalculate total store stock if stock changed
      const totalStock = updatedVariantMappings.reduce((sum, vm) => sum + vm.stock, 0);
      return { ...m, variantMappings: updatedVariantMappings, stock: totalStock };
    }));
  };

  const getVariantLabel = (vId: string) => {
    const v = product.variants.find(v => v.id === vId);
    return v ? `${v.color} / ${v.size}` : 'Unknown Variant';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Store Inventory</h2>
            <p className="text-sm text-gray-500">{product.name} — Bulk Configuration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Store Selection */}
          <div className="w-full md:w-1/4 border-r border-gray-100 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Storefronts</h3>
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
                      <p className="text-sm font-bold text-gray-900 leading-tight">{store.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{store.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mapping Configuration */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
            {mappings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ICONS.Map className="w-12 h-12 opacity-20" />
                <p className="text-center italic text-sm">Select a store from the left to start mapping inventory.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {mappings.map(mapping => {
                  const store = stores.find(s => s.id === mapping.storeId);
                  return (
                    <div key={mapping.storeId} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{store?.name}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">{store?.type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Enabled</span>
                            <button 
                              onClick={() => handleUpdateMapping(mapping.storeId, { enabled: !mapping.enabled })}
                              className={`w-8 h-4 rounded-full relative transition-colors ${mapping.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${mapping.enabled ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        {mapping.variantMappings.length === 0 ? (
                           <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Base Store SKU</label>
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                                  value={mapping.spid}
                                  onChange={e => handleUpdateMapping(mapping.storeId, { spid: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Store Price</label>
                                <input 
                                  type="number" 
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                  value={mapping.price}
                                  onChange={e => handleUpdateMapping(mapping.storeId, { price: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Store Stock</label>
                                <input 
                                  type="number" 
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                  value={mapping.stock}
                                  onChange={e => handleUpdateMapping(mapping.storeId, { stock: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                           </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Variant-Specific Inventory</h4>
                            {mapping.variantMappings.map(vm => (
                              <div key={vm.variantId} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Variant</label>
                                  <div className="text-xs font-semibold text-gray-700 truncate">{getVariantLabel(vm.variantId)}</div>
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-gray-400 mb-1">SPID</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono"
                                    value={vm.spid}
                                    onChange={e => handleUpdateVariantMapping(mapping.storeId, vm.variantId, { spid: e.target.value })}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Price ($)</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                                    value={vm.price}
                                    onChange={e => handleUpdateVariantMapping(mapping.storeId, vm.variantId, { price: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Stock</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                                    value={vm.stock}
                                    onChange={e => handleUpdateVariantMapping(mapping.storeId, vm.variantId, { stock: parseInt(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-end pt-2">
                               <span className="text-[10px] font-bold text-gray-500 uppercase">Total Store Inventory: <span className="text-gray-900 font-black">{mapping.stock} units</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-700 font-semibold text-sm">Cancel</button>
          <button 
            onClick={() => onSave(product.id, mappings)}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-sm"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreMappingModal;
