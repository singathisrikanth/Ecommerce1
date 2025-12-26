
import React, { useState } from 'react';
import { Product, ProductStatus, Store, ProductVariant } from '../types';
import { ICONS } from '../constants';

interface ProductListProps {
  products: Product[];
  stores: Store[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMap: (product: Product) => void;
  onToggleMapping: (productId: string, storeId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, stores, onEdit, onDelete, onMap, onToggleMapping }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case ProductStatus.DRAFT: return 'bg-gray-100 text-gray-700';
      case ProductStatus.ARCHIVED: return 'bg-red-100 text-red-700';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const getVariantLabel = (product: Product, variantId: string) => {
    const v = product.variants.find(v => v.id === variantId);
    if (!v) return 'Base';
    return `${v.color}${v.size ? ' / ' + v.size : ''}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU & Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Global Inventory</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <React.Fragment key={product.id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors group cursor-pointer ${expandedId === product.id ? 'bg-blue-50/20' : ''}`} 
                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-400 shadow-inner">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ICONS.Products className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{product.sku}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">${product.basePrice.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {product.mappings.reduce((acc, m) => acc + (m.variantMappings?.reduce((sum, vm) => sum + vm.stock, 0) || m.stock), 0)} units
                        </span>
                        <span className="text-xs text-gray-400">across {product.mappings.length} stores</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onMap(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Manage Store Mappings"
                        >
                          <ICONS.Map className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <ICONS.Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <ICONS.Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === product.id && (
                    <tr className="bg-blue-50/10 border-l-4 border-blue-500">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="space-y-8">
                          {/* AI Gallery Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                              <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-[10px]">AI</span> On-Model Previews
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {product.images?.map((img, idx) => (
                                <div key={idx} className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase tracking-tighter">
                                    {idx === 0 ? 'Original Product' : idx === 1 ? 'Model Preview A' : 'Model Preview B'}
                                  </div>
                                </div>
                              ))}
                              {(!product.images || product.images.length < 2) && (
                                <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 text-gray-400 italic text-sm">
                                  No AI model previews generated for this product.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <ICONS.Stores className="w-4 h-4 text-blue-600" /> Store-Specific Inventory & Pricing
                              </h4>
                              <button 
                                onClick={() => onMap(product)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg transition-all"
                              >
                                Open Bulk Manager
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {product.mappings.length === 0 ? (
                                <p className="text-sm text-gray-500 italic col-span-full py-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                  This product is not mapped to any stores.
                                </p>
                              ) : (
                                product.mappings.map(mapping => (
                                  <div 
                                    key={mapping.storeId} 
                                    className={`bg-white border rounded-2xl flex flex-col shadow-sm transition-all overflow-hidden ${mapping.enabled ? 'border-gray-200' : 'border-red-100 bg-red-50/10 grayscale'}`}
                                  >
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${mapping.enabled ? 'bg-green-500' : 'bg-red-400'}`} />
                                        <span className="text-xs font-bold text-gray-900 truncate">{getStoreName(mapping.storeId)}</span>
                                      </div>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleMapping(product.id, mapping.storeId);
                                        }}
                                        className={`p-1 rounded-md transition-colors ${mapping.enabled ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}
                                      >
                                        <ICONS.Power className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="p-4 space-y-3">
                                      {product.variants.length === 0 ? (
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Base SPID</span>
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{mapping.spid}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Price</span>
                                            <span className="font-bold text-gray-900">${mapping.price.toFixed(2)}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Stock</span>
                                            <span className={`font-bold ${mapping.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>{mapping.stock}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        mapping.variantMappings.map(vm => (
                                          <div key={vm.variantId} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-[11px] font-bold text-gray-700">{getVariantLabel(product, vm.variantId)}</span>
                                              <span className="text-[10px] font-mono text-gray-400">{vm.spid}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px]">
                                              <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Price: <span className="text-gray-900 font-semibold">${vm.price.toFixed(2)}</span></span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Stock: <span className={`font-semibold ${vm.stock < 10 ? 'text-red-600' : 'text-blue-600'}`}>{vm.stock}</span></span>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => onMap(product)}
                                      className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
                                    >
                                      Edit Mapping
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
