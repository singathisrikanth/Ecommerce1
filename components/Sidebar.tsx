
import React from 'react';
import { ViewType } from '../types';
import { ICONS } from '../constants';
import { X } from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'DASHBOARD' as ViewType, label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'ORDERS' as ViewType, label: 'Orders', icon: ICONS.Orders },
    { id: 'PRODUCTS' as ViewType, label: 'Inventory', icon: ICONS.Products },
    { id: 'STORES' as ViewType, label: 'Storefronts', icon: ICONS.Stores },
    { id: 'SETTINGS' as ViewType, label: 'Settings', icon: ICONS.Settings },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ICONS.Marketplace className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight leading-none text-white">UnifiedCommerce</span>
              <span className="text-xs font-bold text-blue-500 tracking-widest uppercase mt-0.5">Hub</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs ring-2 ring-slate-700">SV</div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Srikanth Varma</p>
              <p className="text-xs text-slate-500 truncate">System Admin</p>
            </div>
          </div>
          <button 
            onClick={() => {
              onLogout?.();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
          >
            <ICONS.Power className="w-3.5 h-3.5" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
