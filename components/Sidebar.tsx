
import React from 'react';
import { ViewType } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'DASHBOARD' as ViewType, label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'PRODUCTS' as ViewType, label: 'Inventory', icon: ICONS.Products },
    { id: 'STORES' as ViewType, label: 'Storefronts', icon: ICONS.Stores },
    { id: 'SETTINGS' as ViewType, label: 'Settings', icon: ICONS.Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-xl font-bold tracking-tighter">O</span>
        </div>
        <span className="text-xl font-bold tracking-tight">OmniStore</span>
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

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
          <img src="https://picsum.photos/40/40" alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-slate-700" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Alex Rivera</p>
            <p className="text-xs text-slate-500 truncate">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
