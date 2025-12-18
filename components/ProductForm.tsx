
import React, { useState, useEffect } from 'react';
import { Product, ProductStatus } from '../types';
import { ICONS, CATEGORIES } from '../constants';
import { gemini } from '../services/geminiService';

interface ProductFormProps {
  onSave: (product: Product) => void;
  onClose: () => void;
  initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onClose, initialData }) => {
  const generateGlobalId = () => `GLB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const [formData, setFormData] = useState<Partial<Product>>({
    id: initialData?.id || generateGlobalId(),
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    status: initialData?.status || ProductStatus.DRAFT,
    mappings: initialData?.mappings || [],
    createdAt: initialData?.createdAt || new Date().toISOString()
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if ((formData.basePrice || 0) <= 0) newErrors.basePrice = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData as Product);
    }
  };

  const handleSmartGenerate = async () => {
    if (!formData.name) {
      alert("Please enter a product name first.");
      return;
    }
    setIsGenerating(true);
    try {
      const [desc, suggestedSku] = await Promise.all([
        gemini.generateDescription(formData.name!, formData.category!),
        formData.sku ? Promise.resolve(formData.sku) : gemini.suggestSKU(formData.name!, formData.category!)
      ]);
      setFormData(prev => ({ ...prev, description: desc, sku: suggestedSku }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Create Global Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-400 mb-1.5 uppercase tracking-wider text-[10px]">Global Product ID (Auto)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono text-sm"
                value={formData.id}
                disabled
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all ${errors.sku ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                placeholder="SKU-12345"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              />
              {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Global Product Name</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                placeholder="e.g. Premium Leather Sneakers"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all ${errors.basePrice ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                placeholder="0.00"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
              />
              {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ProductStatus })}
              >
                {Object.values(ProductStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Product Description</label>
                <button 
                  type="button"
                  onClick={handleSmartGenerate}
                  disabled={isGenerating}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="bg-blue-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter">AI</span>
                  {isGenerating ? 'Generating...' : 'Smart Suggestions'}
                </button>
              </div>
              <textarea 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                placeholder="Describe your product benefits..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            {initialData ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
