import React, { useState } from 'react';
import { CartItem, PaymentMethod, Order } from '../types';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Check, 
  ArrowRight,
  User
} from 'lucide-react';
import { playSuccessChime } from '../utils/audio';

interface CheckoutModalProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountName?: string;
  total: number;
  onClose: () => void;
  onCompleteOrder: (orderData: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    discountName?: string;
    total: number;
    paymentMethod: PaymentMethod;
    cashTendered?: number;
    changeGiven?: number;
    customerName?: string;
    cashier: string;
    status: 'Completed';
    itemCount: number;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  subtotal,
  tax,
  discount,
  discountName,
  total,
  onClose,
  onCompleteOrder,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [customerName, setCustomerName] = useState('');
  const [cashTenderedStr, setCashTenderedStr] = useState<string>(Math.ceil(total).toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const cashTendered = parseFloat(cashTenderedStr) || 0;
  const changeGiven = Math.max(0, cashTendered - total);
  const isCashSufficient = cashTendered >= total;

  // Preset cash tender amounts
  const quickCashOptions = [
    { label: `Exact ($${total.toFixed(2)})`, value: total },
    { label: `$${Math.ceil(total)}`, value: Math.ceil(total) },
    { label: '$10.00', value: 10 },
    { label: '$20.00', value: 20 },
    { label: '$50.00', value: 50 },
  ].filter((opt, i, self) => opt.value >= total && self.findIndex(o => o.value === opt.value) === i);

  const handleComplete = () => {
    if (method === 'cash' && !isCashSufficient) {
      return;
    }

    setIsProcessing(true);
    playSuccessChime();

    setTimeout(() => {
      onCompleteOrder({
        items,
        subtotal,
        tax,
        discount,
        discountName,
        total,
        paymentMethod: method,
        cashTendered: method === 'cash' ? cashTendered : undefined,
        changeGiven: method === 'cash' ? changeGiven : undefined,
        customerName: customerName.trim() || undefined,
        cashier: 'Alex Carter',
        status: 'Completed',
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      });
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Process Checkout</h3>
            <div className="text-xs text-stone-500">
              {items.length} drink items in order ticket
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Total Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-bold text-amber-900 tracking-wider">
                Total Due
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono tabular-nums">
                ${total.toFixed(2)}
              </div>
            </div>
            {discount > 0 && (
              <div className="text-right text-xs text-amber-800">
                <span>Saved ${discount.toFixed(2)} with {discountName}</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'card'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'cash'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qr')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'qr'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mobile')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'mobile'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">Apple Pay</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Details */}
          {method === 'cash' && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700">
                  Cash Tendered ($)
                </label>
                <span className="text-xs text-stone-500">
                  Total: ${total.toFixed(2)}
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashTenderedStr}
                onChange={(e) => setCashTenderedStr(e.target.value)}
                className="w-full text-xl font-bold font-mono px-3 py-2 rounded-lg border border-stone-300 bg-white"
              />

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickCashOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCashTenderedStr(opt.value.toFixed(2))}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Change Calculation */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm">
                <span className="font-medium text-stone-600">Change to Return:</span>
                <span className={`font-mono font-bold text-base tabular-nums ${
                  isCashSufficient ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {isCashSufficient ? `$${changeGiven.toFixed(2)}` : 'Insufficient Cash'}
                </span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-sm font-semibold text-stone-800">
                Card Reader Ready
              </div>
              <p className="text-xs text-stone-500">
                Insert chip, tap contactless card, or swipe to charge ${total.toFixed(2)}.
              </p>
            </div>
          )}

          {method === 'qr' && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-4">
              <div className="w-20 h-20 bg-white p-1.5 border border-stone-300 rounded-lg flex items-center justify-center shrink-0">
                {/* Visual QR Code simulation */}
                <div className="w-full h-full grid grid-cols-5 gap-0.5 bg-stone-900 p-0.5 rounded">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${(i % 2 === 0 || i % 3 === 0) ? 'bg-white' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-stone-800">
                  Scan &amp; Pay ${total.toFixed(2)}
                </div>
                <div className="text-xs text-stone-500">
                  Accepts PromptPay, Venmo, WeChat, or CashApp instant transfer.
                </div>
              </div>
            </div>
          )}

          {method === 'mobile' && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-center space-y-2">
              <Smartphone className="w-8 h-8 text-stone-700 mx-auto" />
              <div className="text-sm font-semibold text-stone-800">
                NFC Mobile Wallet
              </div>
              <p className="text-xs text-stone-500">
                Hold customer iPhone, Apple Watch, or Android device near reader.
              </p>
            </div>
          )}

          {/* Customer Name (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
              Customer Name / Call Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Taylor, Jordan, Sarah..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isProcessing || (method === 'cash' && !isCashSufficient)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            {isProcessing ? (
              <span>Authorizing Payment...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm Payment · ${total.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
