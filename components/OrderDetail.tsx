
import React, { useState } from 'react';
import { Order, Store, AuditLogEntry } from '../types';
import { ICONS } from '../constants';

interface OrderDetailProps {
  order: Order;
  stores: Store[];
  onBack: () => void;
  onUpdateOrder: (order: Order) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, stores, onBack, onUpdateOrder }) => {
  const [showLabel, setShowLabel] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const store = stores.find(s => s.id === order.storeId);

  // Formatting dates for display
  const orderDateDisplay = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getShipByInfo = (shipByDateStr?: string) => {
    if (!shipByDateStr) return { text: 'N/A', class: 'text-gray-400 bg-gray-50' };
    
    const shipByDate = new Date(shipByDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = shipByDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateText = shipByDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Bold Red if date crossed, Orange if 1 day left
    if (diffDays < 0) return { text: dateText, class: 'text-red-600 bg-red-50 font-black' };
    if (diffDays === 0 || diffDays === 1) return { text: dateText, class: 'text-orange-600 bg-orange-50 font-bold' };
    return { text: dateText, class: 'text-blue-600 bg-blue-50 font-bold' };
  };

  const shipByInfo = getShipByInfo(order.shipBy);

  const handlePrintLabel = () => {
    const isReprint = !!order.trackingNumber;
    const tracking = order.trackingNumber || `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}0921`;
    
    const newEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action: isReprint ? 'Shipping Label Reprinted' : 'Shipping Label Generated',
      user: 'srikanth varma' 
    };

    const updatedOrder: Order = {
      ...order,
      trackingNumber: tracking,
      status: order.status === 'PAID' || order.status === 'PENDING' ? 'SHIPPED' : order.status,
      history: [newEntry, ...order.history]
    };
    onUpdateOrder(updatedOrder);
    setShowLabel(true);
  };

  const handleFulfillToStore = async () => {
    if (!order.trackingNumber) return;
    
    setIsFulfilling(true);
    // Simulate API delay to storefront
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action: `Fulfillment Sync: Posted to ${store?.name}`,
      user: 'srikanth varma'
    };

    const updatedOrder: Order = {
      ...order,
      fulfilledOnSource: true,
      history: [newEntry, ...order.history]
    };

    onUpdateOrder(updatedOrder);
    setIsFulfilling(false);
    alert(`Successfully posted tracking ${order.trackingNumber} to ${store?.name}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold">
          <ICONS.Back className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            order.status === 'PAID' ? 'bg-green-100 text-green-700' : 
            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {order.status}
          </span>
          
          {order.trackingNumber && !order.fulfilledOnSource && (
            <button 
              onClick={handleFulfillToStore}
              disabled={isFulfilling}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isFulfilling ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ICONS.Marketplace className="w-4 h-4" />
              )}
              Fulfill Store
            </button>
          )}

          <button onClick={handlePrintLabel} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2">
            <ICONS.Check className="w-4 h-4" /> 
            {order.trackingNumber ? 'Reprint Ship Label' : 'Print Shipping Label'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><ICONS.Products className="w-4 h-4 text-blue-600" /> Line Items</h3>
              <span className="text-xs text-gray-500 font-medium">MP Order ID: <span className="font-mono">{order.externalId}</span></span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map(item => (
                    <tr key={item.id} className="text-sm">
                      <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="font-medium text-red-600">-${order.discount.toFixed(2)}</span></div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center"><span className="font-bold text-gray-900">Order Total</span><span className="text-xl font-black text-blue-600">${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><ICONS.History className="w-4 h-4 text-amber-500" /> Audit Log & History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {order.history.map((log, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== order.history.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-100" />}
                    <div className="w-5 h-5 rounded-full bg-gray-100 border-4 border-white shadow-sm shrink-0" />
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start"><p className="text-sm font-bold text-gray-800">{log.action}</p><p className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</p></div>
                      <p className="text-xs text-gray-500 mt-0.5">Updated by <span className="font-semibold text-gray-700">{log.user}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">Shipping & Fulfillment</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><ICONS.Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">Order Placed:</span></div>
                <span className="text-sm font-semibold text-gray-900">{orderDateDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-4 h-4 flex items-center justify-center"><div className={`w-2 h-2 rounded-full animate-pulse ${shipByInfo.class.includes('red') ? 'bg-red-500' : shipByInfo.class.includes('orange') ? 'bg-orange-500' : 'bg-blue-500'}`} /></div><span className="text-sm text-gray-600 font-medium">To Ship Date:</span></div>
                <span className={`text-sm px-2 py-1 rounded transition-colors ${shipByInfo.class}`}> {shipByInfo.text} </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2"><ICONS.Packing className="w-4 h-4 text-slate-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Packaging Instruction</span></div>
                <p className="text-sm font-bold text-slate-800 leading-tight">Should pack in: <span className="text-blue-600">{order.packingType}</span></p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><ICONS.Key className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">Method:</span></div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">Priority Mail</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex flex-col gap-1 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Tracking Number</span>
                      {order.fulfilledOnSource && (
                        <span className="text-[9px] font-black text-green-600 flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded">
                          <ICONS.Check className="w-2 h-2" /> STORE SYNCED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
              {!order.trackingNumber && (
                <button className="w-full mt-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group">
                  <ICONS.Plus className="w-3 h-3 text-gray-300 group-hover:text-blue-400" /> Attach Tracking Number
                </button>
              )}
            </div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">Customer Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ICONS.User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div><p className="text-sm font-bold text-gray-900">{order.customer}</p><p className="text-[10px] text-gray-500 uppercase tracking-tight">ID: CUST-{order.id.split('_')[1]}</p></div>
              </div>
              <div className="flex items-start gap-3"><ICONS.Mail className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm text-blue-600 hover:underline cursor-pointer break-all">{order.customerEmail}</p></div>
              <div className="flex items-start gap-3"><ICONS.MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm text-gray-600 leading-relaxed">{order.customerAddress}</p></div>
            </div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Source Storefront</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ICONS.Stores className="w-5 h-5" /></div>
              <div><p className="font-bold text-gray-900">{store?.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{store?.ownership} • {store?.type}</p></div>
            </div>
          </div>
        </div>
      </div>

      {showLabel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-[500px] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-gray-100 flex justify-between items-center border-b">
              <h2 className="text-sm font-bold text-gray-700 uppercase">Shipping Label Preview</h2>
              <button onClick={() => setShowLabel(false)} className="text-gray-400 hover:text-gray-600"><ICONS.X className="w-5 h-5" /></button>
            </div>
            <div className="p-10">
              <div className="border-4 border-black p-4 font-sans text-black max-w-full">
                <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                  <div className="text-[10px] leading-tight font-bold">PRIORITY MAIL<br />UNITED STATES POSTAL SERVICE</div>
                  <div className="text-right text-[8px] font-mono">ORDER: {order.id}<br />MP: {order.externalId}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
                  <div>
                    <span className="font-bold block mb-1">FROM:</span>
                    <div className="uppercase font-bold">UNIFIED COMMERCE<br />{store?.location || 'GLOBAL FULFILLMENT CENTER'}</div>
                  </div>
                  <div className="text-right"><div className="inline-block border-2 border-black p-1 font-black text-xs">ZONE 1</div></div>
                </div>
                <div className="border-2 border-black p-3 mb-4">
                  <span className="font-bold block text-xs mb-1">SHIP TO:</span>
                  <div className="text-sm font-black uppercase leading-tight">{order.customer}<br />{order.customerAddress}</div>
                </div>
                <div className="border-t-2 border-black pt-4 flex flex-col items-center">
                  <div className="w-full bg-black h-12 mb-1" />
                  <div className="flex justify-around w-full h-8 mb-2">{[...Array(24)].map((_, i) => <div key={i} className={`bg-black w-1 ${i % 3 === 0 ? 'h-full' : 'h-3/4'}`} />)}</div>
                  <span className="text-xs font-mono font-black tracking-widest">{order.trackingNumber}</span>
                </div>
                <div className="mt-4 border-t-2 border-black pt-2 flex justify-between text-[8px] font-bold italic">
                  <span>PACKING: {order.packingType}</span>
                  <span>METHOD: PRIORITY MAIL 2-DAY</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setShowLabel(false)} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700">Close</button>
              <button onClick={() => { window.print(); setShowLabel(false); }} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"><ICONS.History className="w-4 h-4" /> Print Label</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
