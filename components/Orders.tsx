
import React, { useState, useRef, useEffect } from 'react';
import { Store, Order } from '../types';
import { ICONS } from '../constants';
import { TimeRange } from '../App';

interface OrdersProps {
  stores: Store[];
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  initialTimeRange?: TimeRange;
}

const Orders: React.FC<OrdersProps> = ({ stores, orders, onViewOrder, onUpdateOrder, initialTimeRange }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'ALL'>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange || 'ALL');
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [isFulfilling, setIsFulfilling] = useState<string | null>(null);
  
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state if prop changes externally (e.g. clicking dashboard metrics)
  useEffect(() => {
    if (initialTimeRange) {
      setTimeRange(initialTimeRange);
    }
  }, [initialTimeRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const storeMatch = selectedStoreId === 'ALL' || order.storeId === selectedStoreId;
      const searchMatch = !searchId || 
        order.externalId.toLowerCase().includes(searchId.toLowerCase()) || 
        order.id.toLowerCase().includes(searchId.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchId.toLowerCase());
      
      let timeMatch = true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const shipByDate = order.shipBy ? new Date(order.shipBy) : null;
      
      if (timeRange === 'TODAY') {
        timeMatch = !!shipByDate && shipByDate.toDateString() === today.toDateString();
      } else if (timeRange === 'TOMORROW') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        timeMatch = !!shipByDate && shipByDate.toDateString() === tomorrow.toDateString();
      } else if (timeRange === 'DELAYED') {
        timeMatch = !!shipByDate && shipByDate < today && order.status !== 'SHIPPED' && order.status !== 'CANCELLED';
      } else if (timeRange !== 'ALL') {
        const orderDate = new Date(order.date);
        const diffTime = today.getTime() - orderDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (timeRange === '30D') timeMatch = diffDays >= 0 && diffDays <= 30;
        else if (timeRange === '90D') timeMatch = diffDays >= 0 && diffDays <= 90;
        else if (timeRange === '180D') timeMatch = diffDays >= 0 && diffDays <= 180;
        else if (timeRange === '365D') timeMatch = diffDays >= 0 && diffDays <= 365;
      }

      return storeMatch && searchMatch && timeMatch;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleFulfillToStore = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (!order.trackingNumber || order.fulfilledOnSource) return;
    
    setIsFulfilling(order.id);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const store = stores.find(s => s.id === order.storeId);
    const updatedOrder: Order = {
      ...order,
      fulfilledOnSource: true,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: `Fulfillment Sync: Posted to ${store?.name || 'Store'}`,
          user: 'srikanth varma'
        },
        ...order.history
      ]
    };

    onUpdateOrder(updatedOrder);
    setIsFulfilling(null);
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    'ALL': 'All Time',
    'TODAY': 'Today',
    'TOMORROW': 'Tomorrow',
    'DELAYED': 'Delayed',
    '30D': 'Past 30 Days',
    '90D': 'Past 90 Days',
    '180D': 'Past 180 Days',
    '365D': 'Past 365 Days'
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PAID': return 'text-green-600 font-bold';
      case 'PENDING': return 'text-amber-600 font-bold';
      case 'SHIPPED': return 'text-blue-600 font-bold';
      case 'CANCELLED': return 'text-red-600 font-bold';
    }
  };

  const getShipByDisplay = (shipByDateStr?: string) => {
    if (!shipByDateStr) return { text: 'N/A', class: 'text-gray-400' };
    
    const shipByDate = new Date(shipByDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = shipByDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateText = shipByDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (diffDays < 0) return { text: dateText, class: 'text-red-600 font-black' };
    if (diffDays === 0 || diffDays === 1) return { text: dateText, class: 'text-orange-500 font-bold' };
    return { text: dateText, class: 'text-gray-800 font-medium' };
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      <div className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wider">
            <span className="text-lg text-blue-400">{filteredOrders.length}</span> Total Orders
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${timeRange === 'DELAYED' ? 'bg-red-600' : 'bg-slate-700'}`}>
            {timeRangeLabels[timeRange]}
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-400">All orders including tracked/synced are visible here</div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Customer, or MP ID..." 
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none h-full h-[42px]"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <div className="relative" ref={storeDropdownRef}>
            <button 
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded bg-white hover:border-blue-400 transition-colors w-44 text-left h-[42px]"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Stores</span>
                <span className="text-xs font-semibold text-gray-700 truncate">
                  {selectedStoreId === 'ALL' ? 'All Stores' : stores.find(s => s.id === selectedStoreId)?.name}
                </span>
              </div>
              <ICONS.ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStoreDropdownOpen && (
              <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => { setSelectedStoreId('ALL'); setIsStoreDropdownOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors border-b border-gray-100 ${selectedStoreId === 'ALL' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'}`}
                >
                  All Stores
                </button>
                {stores.map(store => (
                  <button
                    key={store.id}
                    onClick={() => { setSelectedStoreId(store.id); setIsStoreDropdownOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors flex items-center justify-between ${selectedStoreId === store.id ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    <span className="truncate">{store.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={timeDropdownRef}>
            <button 
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded bg-amber-50/30 hover:border-amber-400 transition-colors w-44 text-left h-[42px]"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-amber-500 uppercase leading-none mb-0.5">Time Range</span>
                <span className="text-xs font-semibold text-gray-700 truncate">{timeRangeLabels[timeRange]}</span>
              </div>
              <ICONS.ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTimeDropdownOpen && (
              <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded shadow-xl overflow-hidden">
                {(['ALL', 'TODAY', 'TOMORROW', 'DELAYED', '30D', '90D', '180D', '365D'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range); setIsTimeDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 ${timeRange === range ? 'text-amber-600 font-bold bg-amber-50/50' : 'text-gray-700'}`}
                  >
                    {timeRangeLabels[range]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => {setSearchId(''); setTimeRange('ALL'); setSelectedStoreId('ALL');}}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors h-[42px]"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">Order #</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-28">Ship By</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Store Sync</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">MP Order</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-36">Store</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32 text-center">Ordered On</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-24">Total</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Packing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-gray-400 italic bg-gray-50/30">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const shipByInfo = getShipByDisplay(order.shipBy);
                  const store = stores.find(s => s.id === order.storeId);
                  const orderDate = new Date(order.date);
                  const todayDate = new Date();
                  todayDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.floor((todayDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group cursor-pointer text-[11px]" onClick={() => onViewOrder(order)}>
                      <td className="px-4 py-4"><span className="font-bold text-blue-600 hover:underline">{order.id.replace('ord_', '')}</span></td>
                      <td className="px-4 py-4 text-center"><span className={shipByInfo.class}>{shipByInfo.text}</span></td>
                      <td className="px-4 py-4"><span className={getStatusColor(order.status)}>{order.status}</span></td>
                      <td className="px-4 py-4">
                        {order.fulfilledOnSource ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-bold">
                            <ICONS.Check className="w-3 h-3" />
                            <span>Synced</span>
                          </div>
                        ) : order.trackingNumber ? (
                          <button 
                            onClick={(e) => handleFulfillToStore(e, order)}
                            disabled={isFulfilling === order.id}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-2 py-1 rounded text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 w-full max-w-[100px]"
                          >
                            {isFulfilling === order.id ? <div className="w-2 h-2 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ICONS.Marketplace className="w-2.5 h-2.5" />}
                            Fulfill
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No Track</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-500">{order.externalId}</td>
                      <td className="px-4 py-4"><span className="font-semibold truncate block">{store?.name}</span></td>
                      <td className="px-4 py-4 text-center text-gray-500">{diffDays === 0 ? 'Today' : `${diffDays}d ago`}</td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-4 text-gray-600 italic font-medium truncate">{order.packingType}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
