
import React, { useState } from 'react';
import { Store, StoreCredentials } from '../types';
import { ICONS } from '../constants';

interface StoreFormProps {
  onSave: (store: Store) => void;
  onClose: () => void;
  initialData?: Store;
}

const StoreForm: React.FC<StoreFormProps> = ({ onSave, onClose, initialData }) => {
  const generateStoreId = () => `ST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const [formData, setFormData] = useState<Partial<Store>>({
    id: initialData?.id || generateStoreId(),
    name: initialData?.name || '',
    location: initialData?.location || '',
    type: initialData?.type || 'ONLINE',
    ownership: initialData?.ownership || 'OWN',
    credentials: initialData?.credentials || { apiKey: '', apiSecret: '', endpoint: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Store name is required';
    if (!formData.location) newErrors.location = 'Location/Region is required';
    if (formData.ownership === 'MARKETPLACE') {
      if (!formData.credentials?.apiKey) newErrors.apiKey = 'API Key is required for marketplaces';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData as Store);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Storefront' : 'Connect New Storefront'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store / Marketplace Name</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                placeholder="e.g. Amazon US, Tokyo Retail Hub..."
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ownership Type</label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership: 'OWN' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.ownership === 'OWN' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ICONS.OwnStore className="w-3.5 h-3.5" />
                  Own Store
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership: 'MARKETPLACE' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.ownership === 'MARKETPLACE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ICONS.Marketplace className="w-3.5 h-3.5" />
                  Marketplace
                </button>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store ID (Auto)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-mono text-sm"
                value={formData.id}
                disabled
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Region / Location</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. New York, Global, EU West..."
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Type</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="ONLINE">Online Store</option>
                <option value="RETAIL">Retail Location</option>
                <option value="WAREHOUSE">Warehouse Hub</option>
              </select>
            </div>

            {formData.ownership === 'MARKETPLACE' && (
              <div className="col-span-2 space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <ICONS.Key className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-purple-700 uppercase tracking-widest">Marketplace API Keys</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">API Client Key</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-100 outline-none font-mono text-xs ${errors.apiKey ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'}`}
                      placeholder="Enter Marketplace API Key..."
                      value={formData.credentials?.apiKey}
                      onChange={e => setFormData({ 
                        ...formData, 
                        credentials: { ...formData.credentials, apiKey: e.target.value } 
                      })}
                    />
                    {errors.apiKey && <p className="mt-1 text-[10px] text-red-500">{errors.apiKey}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">API Secret / Token</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none font-mono text-xs"
                      placeholder="••••••••••••••••"
                      value={formData.credentials?.apiSecret}
                      onChange={e => setFormData({ 
                        ...formData, 
                        credentials: { ...formData.credentials, apiSecret: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
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
            className={`px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all ${formData.ownership === 'MARKETPLACE' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
          >
            {initialData ? 'Update Store' : 'Connect Store'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreForm;
