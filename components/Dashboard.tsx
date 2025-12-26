
import React, { useState } from 'react';
import { Product, Store, Order, ViewType } from '../types';
import { ICONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TimeRange } from '../App';

interface DashboardProps {
  products: Product[];
  stores: Store[];
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  onNavigateWithFilter: (range: TimeRange) => void;
  onViewChange: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, stores, orders, onUpdateOrder, onNavigateWithFilter, onViewChange }) => {
  const [isFulfilling, setIsFulfilling] = useState<string | null>(null);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.mappings.reduce((s, m) => s + m.stock, 0), 0);
  const activeMappings = products.reduce((acc, p) => acc + p.mappings.filter(m => m.enabled).length, 0);

  // Time-based calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayOrders = orders.filter(o => o.shipBy && new Date(o.shipBy).toDateString() === today.toDateString());
  const tomorrowOrders = orders.filter(o => o.shipBy && new Date(o.shipBy).toDateString() === tomorrow.toDateString());
  const delayedOrders = orders.filter(o => {
    if (!o.shipBy || o.status === 'SHIPPED' || o.status === 'CANCELLED') return false;
    return new Date(o.shipBy) < today;
  });

  const stats = [
    { label: 'Global SKUs', value: totalProducts, icon: ICONS.Products, color: 'text-blue-600', bg: 'bg-blue-50', target: 'PRODUCTS' as ViewType },
    { label: 'Active Mappings', value: activeMappings, icon: ICONS.Map, color: 'text-green-600', bg: 'bg-green-50', target: 'PRODUCTS' as ViewType },
    { label: 'Total Orders', value: orders.length, icon: ICONS.Orders, color: 'text-sky-600', bg: 'bg-sky-50', target: 'ORDERS' as ViewType },
    { label: 'Managed Stores', value: stores.length, icon: ICONS.Stores, color: 'text-orange-600', bg: 'bg-orange-50', target: 'STORES' as ViewType },
    { label: 'Total Inventory', value: totalStock, icon: ICONS.Check, color: 'text-purple-600', bg: 'bg-purple-50', target: 'PRODUCTS' as ViewType },
  ];

  const shipmentAlerts = [
    { label: 'Today', value: todayOrders.length, range: 'TODAY' as TimeRange, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Tomorrow', value: tomorrowOrders.length, range: 'TOMORROW' as TimeRange, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Delayed', value: delayedOrders.length, range: 'DELAYED' as TimeRange, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  // Logic: Orders that have tracking but aren't synced to storefront
  const pendingSyncOrders = orders.filter(o => o.trackingNumber && !o.fulfilledOnSource);

  const handleFulfillToStore = async (order: Order) => {
    setIsFulfilling(order.id);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const store = stores.find(s => s.id === order.storeId);
    const updatedOrder: Order = {
      ...order,
      fulfilledOnSource: true,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: `Dashboard Sync: Posted to ${store?.name || 'Store'}`,
          user: 'srikanth varma'
        },
        ...order.history
      ]
    };

    onUpdateOrder(updatedOrder);
    setIsFulfilling(null);
  };

  // Prepare chart data
  const stockByStore = stores.map(store => ({
    name: store.name.split(' ')[0],
    stock: products.reduce((acc, p) => {
      const m = p.mappings.find(m => m.storeId === store.id);
      return acc + (m ? m.stock : 0);
    }, 0)
  }));

  const categoryData = products.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) existing.value += 1;
    else acc.push({ name: p.category, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Shipment Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shipmentAlerts.map((alert, idx) => (
          <button 
            key={idx} 
            onClick={() => onNavigateWithFilter(alert.range)}
            className={`bg-white p-6 rounded-2xl shadow-sm border ${alert.border} flex items-center justify-between group hover:shadow-md transition-all text-left overflow-hidden relative`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.color.replace('text', 'bg')}`} />
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{alert.label} Shipments</p>
              <p className={`text-3xl font-black ${alert.color}`}>{alert.value}</p>
            </div>
            <div className={`p-3 ${alert.bg} ${alert.color} rounded-xl group-hover:scale-110 transition-transform`}>
              <ICONS.Orders className="w-6 h-6" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <button 
            key={idx} 
            onClick={() => onViewChange(stat.target)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-lg hover:scale-[1.02] transition-all text-left group"
          >
            <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:rotate-6 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fulfillment Sync Queue */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ICONS.Marketplace className="w-5 h-5 text-purple-600" />
              Sync Queue
            </h3>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              {pendingSyncOrders.length} Ready
            </span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {pendingSyncOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                <ICONS.Check className="w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium italic">All storefronts synced.</p>
              </div>
            ) : (
              pendingSyncOrders.map(order => {
                const store = stores.find(s => s.id === order.storeId);
                return (
                  <div key={order.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-black text-blue-600 mb-0.5">{order.id}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{store?.name}</p>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 bg-gray-200 px-1 rounded truncate max-w-[80px]">{order.trackingNumber}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs font-bold text-gray-800">{order.customer.split(' ')[0]}</p>
                      <button 
                        onClick={() => handleFulfillToStore(order)}
                        disabled={isFulfilling === order.id}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-200 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {isFulfilling === order.id ? (
                          <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ICONS.Plus className="w-3 h-3" />
                        )}
                        Fulfill Store
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Inventory distribution chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Stock Distribution by Store</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByStore}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Category distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Inventory by Category</h3>
          <div className="h-[250px] flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                  <span className="text-sm font-bold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
