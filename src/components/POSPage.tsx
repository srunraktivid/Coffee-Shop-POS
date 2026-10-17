import React, { useState, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  ProductCategory, 
  Customization 
} from '../types';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  SlidersHorizontal, 
  ShoppingBag, 
  Coffee,
  Sparkles,
  Percent,
  Check
} from 'lucide-react';
import { playBeep } from '../utils/audio';

interface POSPageProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, customization?: Customization, unitPrice?: number) => void;
  onUpdateCartItemQty: (cartItemId: string, delta: number) => void;
  onRemoveCartItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: (discountRate: number, discountName?: string) => void;
  onOpenCustomizer: (product: Product) => void;
}

export const POSPage: React.FC<POSPageProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartItemQty,
  onRemoveCartItem,
  onClearCart,
  onOpenCheckout,
  onOpenCustomizer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('takeaway');
  const [activeDiscount, setActiveDiscount] = useState<{ rate: number; name: string } | null>(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Reactive price calculations (signals / computed)
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;
    return subtotal * activeDiscount.rate;
  }, [subtotal, activeDiscount]);

  const tax = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * 0.07; // 7% standard rate
  }, [subtotal, discountAmount]);

  const totalPrice = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + tax);
  }, [subtotal, discountAmount, tax]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    playBeep(880, 0.05);
    onAddToCart(product);
  };

  const categories: (ProductCategory | 'All')[] = ['All', 'Hot', 'Iced', 'Specialty', 'Bakery'];

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-stone-100">
      {/* LEFT: Coffee & Food Products Grid */}
      <section className="flex-1 flex flex-col min-w-0 border-r border-stone-200 bg-stone-50/60 overflow-hidden">
        {/* Top Search & Filter Bar */}
        <div className="p-4 bg-white border-b border-stone-200 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search espresso, latte, iced drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-100/80 rounded-xl border border-transparent focus:border-stone-300 focus:bg-white focus:outline-hidden transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Count Info */}
            <div className="text-xs text-stone-500 font-medium shrink-0">
              Showing {filteredProducts.length} of {products.length} items
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {cat === 'All' ? 'All Menu' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
              <Coffee className="w-12 h-12 mb-3 opacity-40" />
              <div className="text-base font-semibold text-stone-700">No drinks match criteria</div>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Try searching for another drink keyword or select another category above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.available === false || (product.stock !== undefined && product.stock <= 0);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) onOpenCustomizer(product);
                    }}
                    className={`group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer ${
                      isOutOfStock ? 'opacity-50 pointer-events-none' : 'hover:border-amber-300'
                    }`}
                  >
                    {/* Image Area */}
                    <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {/* Price Badge on photo */}
                      <div className="absolute bottom-2 left-2 bg-stone-900/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-xs font-bold font-mono tabular-nums">
                        ${product.price.toFixed(2)}
                      </div>

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white uppercase tracking-wider bg-rose-600/90 px-2 py-1 rounded">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Anti-slop clean metadata */}
                        <div className="text-[11px] text-stone-500 font-medium mb-0.5">
                          <span>{product.category}</span>
                          {product.stock !== undefined && (
                            <>
                              <span aria-hidden="true" className="mx-1">·</span>
                              <span>{product.stock} in stock</span>
                            </>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCustomizer(product);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors flex items-center gap-1"
                          title="Customize milk, size, syrup"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Custom</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-900 hover:bg-amber-700 text-white transition-colors shrink-0 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT: Order Ticket / Cart View */}
      <aside className="w-96 md:w-[380px] lg:w-[420px] bg-white flex flex-col shrink-0 shadow-lg border-l border-stone-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-stone-900">Current Order</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Dine In vs Takeaway Toggle */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 rounded-md transition-all ${
                orderType === 'takeaway'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Takeaway Cup
            </button>
            <button
              onClick={() => setOrderType('dine-in')}
              className={`py-1.5 rounded-md transition-all ${
                orderType === 'dine-in'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Dine-In Ceramic
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Coffee className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-stone-700">Order is Empty</div>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
                Tap any coffee drink card on the left to start building this customer ticket.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const details = [
                item.customization.size !== 'Regular' ? item.customization.size : null,
                item.customization.milk !== 'None' ? `${item.customization.milk} Milk` : null,
                item.customization.sweetness !== '100% (Standard)' ? item.customization.sweetness.split(' ')[0] : null,
                item.customization.extraShot ? '+Extra Shot' : null,
                item.customization.notes ? `"${item.customization.notes}"` : null,
              ].filter(Boolean).join(' · ');

              return (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col gap-2 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 font-mono">
                          {item.quantity}x
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.product.name}
                        </h4>
                      </div>
                      {details && (
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                          {details}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-bold text-stone-900 font-mono tabular-nums shrink-0">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                      ${item.unitPrice.toFixed(2)} each
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          playBeep(700, 0.04);
                          onUpdateCartItemQty(item.cartItemId, -1);
                        }}
                        className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-5 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => {
                          playBeep(880, 0.04);
                          onUpdateCartItemQty(item.cartItemId, 1);
                        }}
                        className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onRemoveCartItem(item.cartItemId)}
                        className="w-6 h-6 rounded-md hover:bg-rose-100 flex items-center justify-center text-stone-400 hover:text-rose-600 ml-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 space-y-3">
          {/* Quick Discount Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" /> Apply Discount
              </span>
              {activeDiscount && (
                <button
                  onClick={() => setActiveDiscount(null)}
                  className="text-stone-400 hover:text-stone-700 text-[10px]"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'None', rate: 0, name: '' },
                { label: '10% Member', rate: 0.10, name: 'VIP Member (10%)' },
                { label: '15% Happy Hr', rate: 0.15, name: 'Happy Hour (15%)' },
              ].map((disc) => {
                const isSelected = (!activeDiscount && disc.rate === 0) || activeDiscount?.name === disc.name;
                return (
                  <button
                    key={disc.label}
                    onClick={() => {
                      if (disc.rate === 0) setActiveDiscount(null);
                      else setActiveDiscount({ rate: disc.rate, name: disc.name });
                    }}
                    className={`py-1 px-1.5 text-[10px] rounded-md border font-medium truncate transition-colors ${
                      isSelected
                        ? 'border-amber-600 bg-amber-100 text-amber-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {disc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Math Breakdown */}
          <div className="space-y-1 text-xs text-stone-600 border-t border-stone-200/80 pt-2">
            <div className="flex justify-between">
              <span>Subtotal ({totalItemCount} items)</span>
              <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-amber-800">
                <span>Discount ({activeDiscount?.name})</span>
                <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-500">
              <span>Sales Tax (7%)</span>
              <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-900 pt-1.5 border-t border-stone-200">
              <span>Total Due</span>
              <span className="font-mono tabular-nums text-lg text-amber-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay Now Button (Phase 5 requirement) */}
          <button
            onClick={() => onOpenCheckout(activeDiscount?.rate || 0, activeDiscount?.name)}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-bold text-base transition-colors shadow-sm flex items-center justify-between"
          >
            <span>Charge Order</span>
            <span className="font-mono tabular-nums text-lg">
              ${totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
};
