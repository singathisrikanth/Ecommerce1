
import React, { useState } from 'react';
import { Product, Store, StoreMapping, ProductStatus } from '../types';
import { ICONS } from '../constants';

interface ProductDetailProps {
  product: Product;
  stores: Store[];
  onBack: () => void;
  onEdit: () => void;
  onMap: () => void;
  onToggleMapping: (storeId: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, stores, onBack, onEdit, onMap, onToggleMapping }) => {
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);

  const getStoreName = (storeId: string) => stores.find(s => s.id === storeId)?.name || storeId;

  const handleManualSync = async (storeId: string) => {
    setSyncingStoreId(storeId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncingStoreId(null);
  };

  const totalInventory = product.mappings.reduce((acc, m) => acc + (m.variantMappings?.reduce((sum, vm) => sum + vm.stock, 0) || m.stock), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold">
          <ICONS.Back className="w-4 h-4" /> Back to Inventory
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onMap}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <ICONS.Variants className="w-4 h-4" /> Open Bulk Manager
          </button>
          <button 
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <ICONS.Edit className="w-4 h-4" /> Edit Global Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Info & Media */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-1">
              <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover rounded-[22px]" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.category}</span>
                <h2 className="text-2xl font-black text-gray-900 mt-1">{product.name}</h2>
                <p className="text-xs font-mono text-gray-400 mt-1">GLB-ID: {product.id}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 p-3 bg-gray-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Base Price</p>
                   <p className="text-lg font-black text-gray-900">${product.basePrice.toFixed(2)}</p>
                </div>
                <div className="flex-1 p-3 bg-blue-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Total Stock</p>
                   <p className="text-lg font-black text-blue-700">{totalInventory}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">AI Generated Previews</p>
                <div className="grid grid-cols-2 gap-3">
                  {product.images.slice(1, 3).map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100">
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Global Description</p>
                 <p className="text-sm text-gray-600 leading-relaxed italic">"{product.description}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Store Mappings & Sync Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ICONS.Stores className="w-5 h-5 text-blue-600" />
                Store-Specific Inventory & Pricing
              </h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-gray-400">STATUS:</span>
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   Sync Engine Active
                 </span>
              </div>
            </div>

            <div className="p-0">
              {product.mappings.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <ICONS.Map className="w-12 h-12 text-gray-200 mx-auto" />
                  <p className="text-gray-500 italic">This product hasn't been mapped to any stores yet.</p>
                  <button onClick={onMap} className="text-blue-600 font-bold hover:underline">Connect to Storefronts</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {product.mappings.map(mapping => {
                    const store = stores.find(s => s.id === mapping.storeId);
                    const isSyncing = syncingStoreId === mapping.storeId;
                    
                    return (
                      <div key={mapping.storeId} className={`p-8 transition-all ${mapping.enabled ? 'bg-white' : 'bg-gray-50 grayscale opacity-60'}`}>
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                          <div className="flex-1 space-y-6">
                            {/* Store Identity */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${store?.ownership === 'MARKETPLACE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {store?.ownership === 'MARKETPLACE' ? <ICONS.Marketplace className="w-6 h-6" /> : <ICONS.OwnStore className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-gray-900 leading-tight">{store?.name}</h4>
                                  <p className="text-xs text-gray-500 font-medium">{store?.location} • {store?.type}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => onToggleMapping(mapping.storeId)}
                                className={`p-2 rounded-xl transition-all ${mapping.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                title={mapping.enabled ? "Disable Mapping" : "Enable Mapping"}
                              >
                                <ICONS.Power className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Core Mapping Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Base SPID</p>
                                <p className="text-lg font-black text-gray-900 font-mono">{mapping.spid}</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Price</p>
                                <p className="text-lg font-black text-blue-600">${mapping.price.toFixed(2)}</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Stock</p>
                                <p className="text-lg font-black text-gray-900">{mapping.stock}</p>
                              </div>
                            </div>

                            {/* Detailed Sync Status */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                               <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync Status</span>
                                  <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded">Healthy</span>
                               </div>
                               <div className="grid grid-cols-3 gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><ICONS.Products className="w-4 h-4" /></div>
                                    <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase">Product Sync</p>
                                      <p className="text-xs font-bold text-gray-800">Synced</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm"><ICONS.Financials className="w-4 h-4" /></div>
                                    <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase">Pricing Sync</p>
                                      <p className="text-xs font-bold text-gray-800">Synced</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm"><ICONS.Check className="w-4 h-4" /></div>
                                    <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase">Image Sync</p>
                                      <p className="text-xs font-bold text-gray-800">Synced</p>
                                    </div>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-row xl:flex-col gap-3 shrink-0">
                            <button 
                              onClick={() => handleManualSync(mapping.storeId)}
                              disabled={isSyncing || !mapping.enabled}
                              className="flex-1 xl:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                            >
                              {isSyncing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <ICONS.History className="w-4 h-4" />
                              )}
                              Sync Now
                            </button>
                            <button 
                              onClick={onMap}
                              className="flex-1 xl:flex-none px-6 py-3 bg-white border border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                              <ICONS.Edit className="w-4 h-4" />
                              Edit Mapping
                            </button>
                          </div>
                        </div>

                        {/* Variant Sync Status if applicable */}
                        {mapping.variantMappings.length > 0 && (
                          <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex gap-4">
                              {mapping.variantMappings.map((vm, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                                   <span className="text-[10px] font-bold text-gray-500">{vm.spid.split('-').pop()} Synced</span>
                                </div>
                              ))}
                            </div>
                            <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5 hover:gap-2 transition-all">
                              View Full Store Log
                              <ICONS.ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <ICONS.History className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Automation History</h4>
                <p className="text-sm text-gray-500">Inventory reconciliation runs every 60 minutes via n8n.</p>
              </div>
            </div>
            <button className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest border-b-2 border-transparent hover:border-gray-200 pb-1">
              Configure Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
