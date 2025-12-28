
import React, { useState } from 'react';
import { Product, ProductStatus, Store, ProductVariant } from '../types';
import { ICONS } from '../constants';

interface ProductListProps {
  products: Product[];
  stores: Store[];
  onViewProduct: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onMap: (product: Product) => void;
  onToggleMapping: (productId: string, storeId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, stores, onViewProduct, onEdit, onDelete, onMap, onToggleMapping }) => {
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
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Mappings</th>
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
                <tr 
                  key={product.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer" 
                  onClick={() => onViewProduct(product)}
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
                        <p className="text-xs text-gray-500 font-mono">ID: {product.id}</p>
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-700">{product.mappings.filter(m => m.enabled).length} Active</span>
                      <span className="text-[10px] text-gray-400">of {product.mappings.length} stores</span>
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
                        title="Bulk Mapping"
                      >
                        <ICONS.Map className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(product)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit Data"
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
