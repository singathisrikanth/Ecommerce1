
import React, { useState, useRef, useEffect } from 'react';
import { Store, Order } from '../types';
import { ICONS } from '../constants';
import { TimeRange } from '../App';

interface OrdersProps {
  stores: Store[];
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onCombineOrders: (ids: string[]) => void;
  initialTimeRange?: TimeRange;
}

const Orders: React.FC<OrdersProps> = ({ stores, orders, onViewOrder, onUpdateOrder, onCombineOrders, initialTimeRange }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'ALL'>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange || 'ALL');
  const [searchId, setSearchId] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isFulfilling, setIsFulfilling] = useState<string | null>(null);

  useEffect(() => {
    if (initialTimeRange) setTimeRange(initialTimeRange);
  }, [initialTimeRange]);

  const filteredOrders = orders.filter(order => {
    const storeMatch = selectedStoreId === 'ALL' || order.storeId === selectedStoreId;
    const searchMatch = !searchId || order.id.includes(searchId) || order.customer.includes(searchId);
    return storeMatch && searchMatch;
  });

  const toggleSelectOrder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const handleBulkCombine = () => {
    if (selectedOrderIds.length < 2) return;
    onCombineOrders(selectedOrderIds);
    setSelectedOrderIds([]);
  };

  return (
    <div className="flex flex-col h-full space-y-4 relative">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          value={selectedStoreId}
          onChange={e => setSelectedStoreId(e.target.value)}
        >
          <option value="ALL">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={(e) => setSelectedOrderIds(e.target.checked ? filteredOrders.map(o => o.id) : [])}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Order #</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Customer</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Status</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Items</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Total</th>
              <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(order => (
              <tr 
                key={order.id} 
                onClick={() => onViewOrder(order)}
                className={`hover:bg-blue-50/20 cursor-pointer transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}
              >
                <td className="px-6 py-4" onClick={(e) => toggleSelectOrder(e, order.id)}>
                   <input type="checkbox" checked={selectedOrderIds.includes(order.id)} readOnly className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-4 font-bold text-blue-600">
                  {order.id.replace('ord_', '')}
                  {order.isCombined && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1 rounded">COMBINED</span>}
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold">{order.customer}</p>
                  <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[11px] font-bold ${order.status === 'PAID' ? 'text-green-600' : 'text-blue-600'}`}>{order.status}</span>
                </td>
                <td className="px-4 py-4 text-xs font-medium text-gray-600">{order.itemCount} items</td>
                <td className="px-4 py-4 text-right font-bold text-gray-900">${order.total.toFixed(2)}</td>
                <td className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{order.packingType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-300">
           <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg">{selectedOrderIds.length}</span>
              <span className="text-sm font-bold">Orders Selected</span>
           </div>
           <div className="h-6 w-px bg-slate-700" />
           <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkCombine}
                className="flex items-center gap-2 text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                <ICONS.Merge className="w-4 h-4" />
                Combine Shipments
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all">
                <ICONS.Check className="w-4 h-4" />
                Mark as Paid
              </button>
              <button onClick={() => setSelectedOrderIds([])} className="text-sm font-bold text-red-400 hover:text-red-300 px-2">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
