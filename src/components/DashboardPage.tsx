import React, { useMemo, useState } from 'react';
import { Order, Product } from '../types';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Coffee, 
  Clock, 
  CreditCard,
  Printer,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface DashboardPageProps {
  orders: Order[];
  products: Product[];
  onViewReceipt: (order: Order) => void;
  onNavigateToPOS: () => void;
  onResetData: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  orders,
  products,
  onViewReceipt,
  onNavigateToPOS,
  onResetData,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered orders based on time range
  const scopedOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    return orders.filter(o => o.createdAt.startsWith(todayStr));
  }, [orders, timeRange, todayStr]);

  // Phase 6 Requirement: Calculate using JavaScript array methods (reduce, length)
  const totalRevenue = useMemo(() => {
    return scopedOrders
      .filter(o => o.status === 'Completed')
      .reduce((sum, order) => sum + order.total, 0);
  }, [scopedOrders]);

  const totalOrders = useMemo(() => {
    return scopedOrders.length;
  }, [scopedOrders]);

  const averageOrderValue = useMemo(() => {
    if (totalOrders === 0) return 0;
    return totalRevenue / totalOrders;
  }, [totalRevenue, totalOrders]);

  const totalItemsSold = useMemo(() => {
    return scopedOrders
      .filter(o => o.status === 'Completed')
      .reduce((sum, order) => sum + order.itemCount, 0);
  }, [scopedOrders]);

  // Top Selling Drinks (aggregated from order items)
  const topSellingDrinks = useMemo(() => {
    const counts: Record<string, { product: Product; quantity: number; revenue: number }> = {};

    scopedOrders
      .filter(o => o.status === 'Completed')
      .forEach(order => {
        order.items.forEach(item => {
          const key = item.product.id;
          if (!counts[key]) {
            counts[key] = {
              product: item.product,
              quantity: 0,
              revenue: 0,
            };
          }
          counts[key].quantity += item.quantity;
          counts[key].revenue += item.totalPrice;
        });
      });

    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [scopedOrders]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number }> = {
      Hot: { count: 0, revenue: 0 },
      Iced: { count: 0, revenue: 0 },
      Specialty: { count: 0, revenue: 0 },
      Bakery: { count: 0, revenue: 0 },
    };

    scopedOrders
      .filter(o => o.status === 'Completed')
      .forEach(order => {
        order.items.forEach(item => {
          const cat = item.product.category;
          if (stats[cat]) {
            stats[cat].count += item.quantity;
            stats[cat].revenue += item.totalPrice;
          }
        });
      });

    const totalCatRevenue = Object.values(stats).reduce((s, c) => s + c.revenue, 0) || 1;

    return Object.entries(stats).map(([category, val]) => ({
      category,
      count: val.count,
      revenue: val.revenue,
      percent: Math.round((val.revenue / totalCatRevenue) * 100),
    }));
  }, [scopedOrders]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const methods: Record<string, number> = {
      card: 0,
      cash: 0,
      qr: 0,
      mobile: 0,
    };
    scopedOrders.forEach(o => {
      if (methods[o.paymentMethod] !== undefined) {
        methods[o.paymentMethod]++;
      }
    });
    return methods;
  }, [scopedOrders]);

  return (
    <div className="flex-1 overflow-y-auto bg-stone-100 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500 font-medium">Analytics &amp; Executive Summary</div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Coffee Shop Sales Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Time range selector */}
          <div className="flex items-center p-1 bg-stone-200 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timeRange === 'today'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Records ({orders.length})
            </button>
          </div>

          <button
            onClick={onNavigateToPOS}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Coffee className="w-4 h-4" />
            <span>Open Register</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className="truncate">Revenue {timeRange === 'today' ? 'Today' : ''}</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-1 truncate">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="truncate">Live reduce()</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className="truncate">Orders {timeRange === 'today' ? 'Today' : ''}</span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-700 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono tabular-nums">
            {totalOrders}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium pt-1 truncate">
            Completed tickets
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className="truncate">Avg Ticket</span>
            <span className="p-1.5 rounded-md bg-sky-50 text-sky-700 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono tabular-nums">
            ${averageOrderValue.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium pt-1 truncate">
            Per transaction
          </div>
        </div>

        {/* Total Items Sold */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className="truncate">Items Served</span>
            <span className="p-1.5 rounded-md bg-orange-50 text-orange-700 shrink-0">
              <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono tabular-nums">
            {totalItemsSold}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium pt-1 truncate">
            Prepared by baristas
          </div>
        </div>
      </div>

      {/* Middle Row: Top Selling Drinks & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Selling Drinks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Top Selling Coffee &amp; Drinks
              </h3>
              <p className="text-xs text-stone-500">
                Ranked by volume sold in selected timeframe
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
              Best Sellers
            </span>
          </div>

          {topSellingDrinks.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              No sales recorded for this period yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topSellingDrinks.map((item, idx) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-stone-50 border border-stone-100 hover:bg-stone-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-stone-200 font-mono font-bold text-[10px] sm:text-xs text-stone-700 flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        <span>{item.product.category}</span>
                        <span aria-hidden="true" className="mx-1">·</span>
                        <span>${item.product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs sm:text-sm font-bold text-stone-900 font-mono tabular-nums">
                      ${item.revenue.toFixed(2)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-stone-500 font-mono">
                      {item.quantity} sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Sales by Category
            </h3>
            <p className="text-xs text-stone-500">
              Revenue distribution by drink format
            </p>

            <div className="space-y-3 mt-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-700">{cat.category}</span>
                    <span className="text-stone-900 font-mono font-bold tabular-nums">
                      ${cat.revenue.toFixed(2)} ({cat.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.category === 'Iced'
                          ? 'bg-sky-500'
                          : cat.category === 'Hot'
                          ? 'bg-amber-600'
                          : cat.category === 'Specialty'
                          ? 'bg-emerald-500'
                          : 'bg-orange-400'
                      }`}
                      style={{ width: `${Math.max(4, cat.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods summary */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              Payment Breakdown
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 bg-stone-50 rounded border border-stone-200/60 truncate">
                <span className="text-stone-500">Card:</span>{' '}
                <span className="font-bold font-mono">{paymentMethodStats.card}</span>
              </div>
              <div className="p-1.5 bg-stone-50 rounded border border-stone-200/60 truncate">
                <span className="text-stone-500">Cash:</span>{' '}
                <span className="font-bold font-mono">{paymentMethodStats.cash}</span>
              </div>
              <div className="p-1.5 bg-stone-50 rounded border border-stone-200/60 truncate">
                <span className="text-stone-500">QR:</span>{' '}
                <span className="font-bold font-mono">{paymentMethodStats.qr}</span>
              </div>
              <div className="p-1.5 bg-stone-50 rounded border border-stone-200/60 truncate">
                <span className="text-stone-500">Apple:</span>{' '}
                <span className="font-bold font-mono">{paymentMethodStats.mobile}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-stone-500">
              Latest receipts processed through the POS system
            </p>
          </div>
          <button
            onClick={onResetData}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
            title="Reset to default sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset Demo</span>
          </button>
        </div>

        {scopedOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No orders completed yet today.
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items Summary</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {scopedOrders.slice(0, 5).map((order) => {
                    const time = new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 text-stone-500 font-mono">
                          {time}
                        </td>
                        <td className="py-2.5 px-3 text-stone-700">
                          {order.customerName || 'Walk-in'}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">
                          {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[11px] text-stone-500">
                          {order.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onViewReceipt(order)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden space-y-2">
              {scopedOrders.slice(0, 5).map((order) => {
                const time = new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-stone-900 flex items-center gap-2">
                        <span>{order.orderNumber}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{time}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 truncate max-w-[200px] mt-0.5">
                        {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        ${order.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onViewReceipt(order)}
                        className="p-1.5 rounded bg-white border border-stone-200 text-stone-700"
                        title="View receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
