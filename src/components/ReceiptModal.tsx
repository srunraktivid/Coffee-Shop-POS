import React from 'react';
import { Order } from '../types';
import { Printer, CheckCircle2, X } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  isNewOrder?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  isNewOrder = false,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isNewOrder && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span className="font-semibold text-sm">
              {isNewOrder ? 'Order Completed & Paid' : 'Order Receipt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto bg-stone-100 flex justify-center">
          {/* Thermal Receipt Container */}
          <div
            id="thermal-receipt-print-area"
            className="bg-white text-stone-900 font-mono text-xs w-[320px] p-5 shadow-md border border-stone-200 select-text leading-relaxed"
          >
            {/* Header */}
            <div className="text-center space-y-1 mb-4 border-b border-dashed border-stone-400 pb-3">
              <h2 className="text-base font-bold tracking-wider uppercase">
                The Coffee Atelier
              </h2>
              <div className="text-[11px] text-stone-600">
                Specialty Roasters &amp; Espresso
              </div>
              <div className="text-[10px] text-stone-500">
                428 Artisan Way, Suite 100
              </div>
              <div className="text-[10px] text-stone-500">Tel: (555) 019-2834</div>
            </div>

            {/* Order Details Info */}
            <div className="space-y-1 mb-3 text-[11px] pb-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-600">Order:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Cashier:</span>
                <span>{order.cashier}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-stone-600">Customer:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="space-y-2 mb-3 pb-3 border-b border-dashed border-stone-400">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-stone-600 pb-1">
                <span className="col-span-2">Qty</span>
                <span className="col-span-7">Item</span>
                <span className="col-span-3 text-right">Price</span>
              </div>
              {order.items.map((item, idx) => {
                const customNotes = [
                  item.customization.size !== 'Regular' ? item.customization.size : null,
                  item.customization.milk !== 'None' ? `${item.customization.milk} Milk` : null,
                  item.customization.sweetness !== '100% (Standard)' ? item.customization.sweetness.split(' ')[0] : null,
                  item.customization.extraShot ? '+Extra Shot' : null,
                  item.customization.notes ? `"${item.customization.notes}"` : null,
                ].filter(Boolean).join(', ');

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="grid grid-cols-12">
                      <span className="col-span-2 font-bold">{item.quantity}x</span>
                      <span className="col-span-7 font-medium truncate">{item.product.name}</span>
                      <span className="col-span-3 text-right font-bold tabular-nums">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {customNotes && (
                      <div className="text-[10px] text-stone-500 pl-4">
                        ↳ {customNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div className="space-y-1 text-xs mb-3 pb-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="tabular-nums">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Discount {order.discountName ? `(${order.discountName})` : ''}:</span>
                  <span className="tabular-nums">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Sales Tax (7%):</span>
                <span className="tabular-nums">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-200">
                <span>TOTAL:</span>
                <span className="tabular-nums">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="space-y-1 text-[11px] mb-4 pb-3 border-b border-dashed border-stone-400">
              <div className="flex justify-between">
                <span className="text-stone-600">Payment:</span>
                <span className="font-semibold uppercase">{order.paymentMethod}</span>
              </div>
              {order.cashTendered !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tendered:</span>
                    <span className="tabular-nums">${order.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Change Due:</span>
                    <span className="font-bold tabular-nums">
                      ${(order.changeGiven ?? 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer Greeting */}
            <div className="text-center space-y-2">
              <div className="h-8 flex items-center justify-center gap-0.5 px-6 opacity-75">
                {/* Visual barcode effect */}
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 3].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w * 1.5}px` }}
                    className="h-full bg-stone-900 inline-block"
                  />
                ))}
              </div>
              <div className="text-[10px] tracking-widest text-stone-600">
                *{order.orderNumber}*
              </div>
              <p className="text-[10px] text-stone-500 pt-2 italic">
                Thank you for your visit! Have an espresso day!
              </p>
              <div className="text-[9px] text-stone-400">
                WiFi: AtelierGuest / Password: artisanroast
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            {isNewOrder ? 'New Order' : 'Close'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
