
import React, { useState } from 'react';
import { Order, Store, AuditLogEntry } from '../types';
import { ICONS } from '../constants';

interface OrderDetailProps {
  order: Order;
  stores: Store[];
  orders: Order[]; // Passed to find source orders
  onBack: () => void;
  onUpdateOrder: (order: Order) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, stores, orders, onBack, onUpdateOrder }) => {
  const [packingMode, setPackingMode] = useState(false);
  const store = stores.find(s => s.id === order.storeId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold">
          <ICONS.Back className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPackingMode(!packingMode)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${packingMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            <ICONS.Checklist className="w-4 h-4" />
            {packingMode ? 'Exit Packing Mode' : 'Packing List Mode'}
          </button>
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2">
            <ICONS.Check className="w-4 h-4" /> 
            Print Ship Label
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Packing Mode View */}
          {packingMode ? (
             <div className="bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 bg-blue-600 text-white">
                   <h3 className="text-xl font-black">Digital Packing List</h3>
                   <p className="text-blue-100 text-sm">Verify all {order.itemCount} items for shipment {order.id}</p>
                </div>
                <div className="p-6 space-y-4">
                   {order.items.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 border border-gray-200">
                              x{item.quantity}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-xs font-mono text-gray-500">{item.sku}</p>
                           </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                           <ICONS.Check className="w-4 h-4 text-transparent group-hover:text-blue-600" />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          ) : (
            <>
              {/* Combined Order Banner */}
              {order.isCombined && (
                <div className="bg-purple-600 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-purple-200">
                   <div className="flex items-center gap-3">
                      <ICONS.Merge className="w-6 h-6" />
                      <div>
                         <p className="font-black">Consolidated Shipment</p>
                         <p className="text-xs text-purple-100 italic">This package contains multiple marketplace orders.</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {order.sourceOrderIds?.map(id => (
                        <span key={id} className="text-[10px] font-bold bg-purple-700/50 px-2 py-1 rounded-lg">#{id.split('_').pop()}</span>
                      ))}
                   </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><ICONS.Products className="w-4 h-4 text-blue-600" /> Order Items</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Product</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Qty</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Unit</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.items.map(item => (
                        <tr key={item.id} className="text-sm">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-[10px] font-mono text-gray-500">{item.sku}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-black">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Customer Details</p>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">{order.customer.charAt(0)}</div>
                    <div>
                       <p className="font-bold text-gray-900">{order.customer}</p>
                       <p className="text-xs text-blue-600">{order.customerEmail}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                     <p className="text-xs text-gray-600 leading-relaxed font-medium">{order.customerAddress}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Shipment Status</p>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-500">Service:</span>
                     <span className="text-xs font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded">Standard Ground</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-500">Package:</span>
                     <span className="text-xs font-bold text-gray-900">{order.packingType}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-[10px] font-black text-gray-400 uppercase">Tracking Number</span>
                    </div>
                    {order.trackingNumber ? (
                      <p className="font-mono text-sm font-bold text-blue-700">{order.trackingNumber}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Not generated yet</p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Financials & Sync */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Order Summary</h3>
             <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-bold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="font-bold text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span className="font-bold">${order.tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Total</span>
                  <span className="text-2xl font-black text-white">${order.total.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Marketplace Status</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${order.fulfilledOnSource ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {order.fulfilledOnSource ? <ICONS.Check className="w-4 h-4" /> : <ICONS.History className="w-4 h-4" />}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-900">{order.fulfilledOnSource ? 'Synced to Source' : 'Pending Sync'}</p>
                      <p className="text-[9px] text-gray-500 uppercase">{store?.name || 'External Channel'}</p>
                   </div>
                </div>
                {!order.fulfilledOnSource && order.trackingNumber && (
                   <button 
                    onClick={() => onUpdateOrder({...order, fulfilledOnSource: true})}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
                   >
                     Force Marketplace Sync
                   </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
