
import React from 'react';
import { Product, Store } from '../types';
import { ICONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  products: Product[];
  stores: Store[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, stores }) => {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.mappings.reduce((s, m) => s + m.stock, 0), 0);
  const activeMappings = products.reduce((acc, p) => acc + p.mappings.filter(m => m.enabled).length, 0);

  const stats = [
    { label: 'Global SKUs', value: totalProducts, icon: ICONS.Products, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Mappings', value: activeMappings, icon: ICONS.Map, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Inventory', value: totalStock, icon: ICONS.Check, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Managed Stores', value: stores.length, icon: ICONS.Stores, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory distribution chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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

        {/* Category distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Inventory by Category</h3>
          <div className="h-[300px] flex items-center">
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
            <div className="flex-1 space-y-3">
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
