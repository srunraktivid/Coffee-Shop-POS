import React, { useState, useMemo } from 'react';
import { Order, PaymentMethod } from '../types';
import { 
  Search, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Filter,
  DollarSign
} from 'lucide-react';

interface OrdersPageProps {
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: 'Completed' | 'Refunded') => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onViewReceipt,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Refunded'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        o.cashier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod = methodFilter === 'all' || o.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [orders, searchQuery, methodFilter, statusFilter]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  return (
    <div className="flex-1 overflow-y-auto bg-stone-100 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500 font-medium">Transactions &amp; Receipts</div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Order History (/orders)
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-stone-200">
          <span>{filteredOrders.length} Orders</span>
          <span className="text-stone-300">|</span>
          <span className="text-emerald-700">${totalFilteredRevenue.toFixed(2)} Revenue</span>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
            className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden"
          >
            <option value="all">All Payments</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="qr">QR Code</option>
            <option value="mobile">Apple Pay</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Completed' | 'Refunded')}
            className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Receipt &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateObj = new Date(order.createdAt);
                  const formattedDate = dateObj.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {order.orderNumber}
                      </td>

                      <td className="py-3 px-4 text-stone-500 font-mono">
                        <div>{formattedDate}</div>
                        <div className="text-[11px] text-stone-400">{formattedTime}</div>
                      </td>

                      <td className="py-3 px-4 text-stone-700">
                        <div>{order.customerName || 'Walk-in Guest'}</div>
                        <div className="text-[10px] text-stone-400">{order.cashier}</div>
                      </td>

                      <td className="py-3 px-4 text-stone-600 max-w-xs">
                        <div className="truncate">
                          {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {order.itemCount} items total
                        </div>
                      </td>

                      <td className="py-3 px-4 uppercase text-[11px] text-stone-600 font-medium">
                        {order.paymentMethod}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 tabular-nums">
                        ${order.total.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            order.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReceipt(order)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors inline-flex items-center gap-1"
                            title="Print / View Thermal Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {order.status === 'Completed' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'Refunded')}
                              className="px-2 py-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 font-medium transition-colors text-[11px]"
                              title="Process Refund"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
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
