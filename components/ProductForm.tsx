
import React, { useState, useRef } from 'react';
import { Product, ProductStatus, ProductVariant } from '../types';
import { ICONS, CATEGORIES } from '../constants';
import { gemini } from '../services/geminiService';

interface ProductFormProps {
  onSave: (product: Product) => void;
  onClose: () => void;
  initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onClose, initialData }) => {
  const generateGlobalId = () => `GLB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    id: initialData?.id || generateGlobalId(),
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    status: initialData?.status || ProductStatus.DRAFT,
    variants: initialData?.variants || [],
    mappings: initialData?.mappings || [],
    images: initialData?.images || [],
    createdAt: initialData?.createdAt || new Date().toISOString()
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageStep, setImageStep] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if ((formData.basePrice || 0) <= 0) newErrors.basePrice = 'Price must be greater than 0';
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least one product image is compulsory';
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, images: [base64String] }));
      
      // Auto-trigger lifestyle generation
      await triggerLifestyleGeneration(base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerLifestyleGeneration = async (sourceImageBase64: string) => {
    setIsGeneratingImages(true);
    setImageStep('Analyzing fabric and textures...');
    
    try {
      // Clean base64 for Gemini (remove prefix)
      const cleanBase64 = sourceImageBase64.split(',')[1];
      
      setImageStep('Generating model preview 1...');
      const modelImages = await gemini.generateLifestyleImages(cleanBase64, formData.category || 'Apparel');
      
      if (modelImages && modelImages.length > 0) {
        setImageStep('Applying studio lighting...');
        setFormData(prev => ({
          ...prev,
          images: [
            sourceImageBase64, 
            ...modelImages.map(data => `data:image/png;base64,${data}`)
          ]
        }));
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setIsGeneratingImages(false);
      setImageStep('');
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Math.random().toString(36).substring(2, 7)}`,
      sku: formData.sku ? `${formData.sku}-NEW` : 'SKU-VAR',
      size: '',
      color: '',
      priceAdjustment: 0
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v => {
        if (v.id !== id) return v;
        const updated = { ...v, ...updates };
        if (formData.sku && (updates.color !== undefined || updates.size !== undefined)) {
          const colorPart = (updated.color || '').substring(0, 3).toUpperCase();
          const sizePart = (updated.size || '').substring(0, 2).toUpperCase();
          updated.sku = `${formData.sku}-${colorPart}${sizePart ? '-' + sizePart : ''}`;
        }
        return updated;
      })
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Create Global Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Media Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ICONS.Products className="w-4 h-4 text-purple-500" />
                Product Media (Compulsory)
              </h3>
              {formData.images && formData.images.length > 0 && !isGeneratingImages && (
                <button 
                  type="button"
                  onClick={() => triggerLifestyleGeneration(formData.images![0])}
                  className="text-[10px] font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-1 rounded"
                >
                  Regenerate AI Previews
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Primary Upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  formData.images?.[0] ? 'border-transparent' : errors.images ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {formData.images?.[0] ? (
                  <>
                    <img src={formData.images[0]} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold">
                      <ICONS.Edit className="w-6 h-6 mb-1" />
                      Replace Primary
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
                      <ICONS.Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">Upload Product Image</span>
                    <span className="text-[10px] text-gray-400 mt-1">Compulsory for AI previews</span>
                  </>
                )}
              </div>

              {/* AI Placeholder 1 */}
              <div className={`h-48 border rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden relative ${isGeneratingImages ? 'border-purple-200 bg-purple-50/50' : 'border-gray-100 bg-gray-50'}`}>
                {isGeneratingImages ? (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                    <span className="text-[10px] font-bold text-purple-700 animate-pulse">{imageStep}</span>
                  </div>
                ) : formData.images?.[1] ? (
                  <>
                    <img src={formData.images[1]} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase rounded shadow-sm">AI Preview A</div>
                  </>
                ) : (
                  <>
                    <ICONS.User className="w-8 h-8 text-gray-200 mb-2" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase">Model Preview 1</span>
                  </>
                )}
              </div>

              {/* AI Placeholder 2 */}
              <div className={`h-48 border rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden relative ${isGeneratingImages ? 'border-purple-200 bg-purple-50/50' : 'border-gray-100 bg-gray-50'}`}>
                {isGeneratingImages ? (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                    <span className="text-[10px] font-bold text-purple-700 animate-pulse">Positioning lighting...</span>
                  </div>
                ) : formData.images?.[2] ? (
                  <>
                    <img src={formData.images[2]} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase rounded shadow-sm">AI Preview B</div>
                  </>
                ) : (
                  <>
                    <ICONS.User className="w-8 h-8 text-gray-200 mb-2" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase">Model Preview 2</span>
                  </>
                )}
              </div>
            </div>
            {errors.images && <p className="text-xs text-red-500 font-medium">{errors.images}</p>}
          </div>

          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Basic Information</h3>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base SKU</label>
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
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Variants</h3>
              <button 
                type="button" 
                onClick={addVariant}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ICONS.Plus className="w-3 h-3" />
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {formData.variants?.length === 0 ? (
                <p className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-sm text-gray-400 italic">
                  No variants defined for this product.
                </p>
              ) : (
                formData.variants?.map((variant, index) => (
                  <div key={variant.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-12 gap-4 items-end animate-in slide-in-from-right-2">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Color</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Red"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                        value={variant.color}
                        onChange={e => updateVariant(variant.id, { color: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</label>
                      <input 
                        type="text" 
                        placeholder="e.g. XL"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                        value={variant.size}
                        onChange={e => updateVariant(variant.id, { size: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price Adj. ($)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                        value={variant.priceAdjustment}
                        onChange={e => updateVariant(variant.id, { priceAdjustment: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Variant SKU</label>
                      <div className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-lg text-[10px] font-mono text-gray-600 truncate">
                        {variant.sku}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => removeVariant(variant.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ICONS.Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 pb-8">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Details & AI</h3>
             <div className="grid grid-cols-2 gap-6">
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
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isGeneratingImages}
            className={`px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all ${isGeneratingImages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {initialData ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
