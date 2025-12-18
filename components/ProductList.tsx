
import React, { useState } from 'react';
import { Product, ProductStatus } from '../types';
import { ICONS } from '../constants';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMap: (product: Product) => void;
  onToggleMapping: (productId: string, storeId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onMap, onToggleMapping }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case ProductStatus.DRAFT: return 'bg-gray-100 text-gray-700';
      case ProductStatus.ARCHIVED: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU & Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory</th>
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
                  <tr className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ICONS.Products className="w-5 h-5" />
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
                          {product.mappings.reduce((acc, m) => acc + m.stock, 0)} units
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
                        >
                          <ICONS.Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <ICONS.Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === product.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                              <ICONS.Stores className="w-4 h-4" /> Store Mappings
                            </h4>
                            <button 
                              onClick={() => onMap(product)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              Manage Mappings
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {product.mappings.length === 0 ? (
                              <p className="text-sm text-gray-500 italic col-span-full py-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                This product is not mapped to any stores.
                              </p>
                            ) : (
                              product.mappings.map(mapping => (
                                <div key={mapping.storeId} className={`p-3 bg-white border rounded-xl flex flex-col gap-1 shadow-sm ${mapping.enabled ? 'border-gray-200' : 'border-red-100 bg-red-50/10 opacity-75'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{mapping.storeId}</span>
                                    <button 
                                      onClick={() => onToggleMapping(product.id, mapping.storeId)}
                                      className={`p-1 rounded-md transition-colors ${mapping.enabled ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                    >
                                      <ICONS.Power className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 italic">SPID:</span>
                                    <span className="font-mono bg-gray-100 px-1 rounded text-gray-700">{mapping.spid}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Store Price:</span>
                                    <span className="font-bold text-blue-600">${mapping.price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Available:</span>
                                    <span className={`font-semibold ${mapping.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>{mapping.stock} units</span>
                                  </div>
                                </div>
                              ))
                            )}
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
