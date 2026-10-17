/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Product, 
  Order, 
  CartItem, 
  NavigationPage, 
  Customization 
} from './types';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { POSPage } from './components/POSPage';
import { DashboardPage } from './components/DashboardPage';
import { MenuPage } from './components/MenuPage';
import { OrdersPage } from './components/OrdersPage';
import { CustomizerModal } from './components/CustomizerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<{ rate: number; name?: string }>({
    rate: 0,
  });
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptNew, setIsReceiptNew] = useState(false);

  // Load initial data from persistent storage
  useEffect(() => {
    setProducts(storageService.getProducts());
    setOrders(storageService.getOrders());

    const handleProductsUpdated = () => {
      setProducts(storageService.getProducts());
    };
    const handleOrdersUpdated = () => {
      setOrders(storageService.getOrders());
    };

    window.addEventListener('baristapro_products_updated', handleProductsUpdated);
    window.addEventListener('baristapro_orders_updated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('baristapro_products_updated', handleProductsUpdated);
      window.removeEventListener('baristapro_orders_updated', handleOrdersUpdated);
    };
  }, []);

  // Compute station metrics for sidebar
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'Completed' && o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, todayStr]);

  const todayOrderCount = useMemo(() => {
    return orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
  }, [orders, todayStr]);

  const totalCartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cart operations
  const handleAddToCart = useCallback((
    product: Product,
    customization?: Customization,
    unitPrice?: number
  ) => {
    const effectiveCustomization: Customization = customization || {
      size: 'Regular',
      milk: product.category === 'Bakery' ? 'None' : 'Whole',
      sweetness: '100% (Standard)',
      temperature: product.category === 'Iced' ? 'Iced' : 'Hot',
      extraShot: false,
    };

    const effectiveUnitPrice = unitPrice !== undefined ? unitPrice : product.price;

    setCart((prevCart) => {
      // Find matching item with identical customizations
      const matchIndex = prevCart.findIndex(
        (ci) =>
          ci.product.id === product.id &&
          ci.customization.size === effectiveCustomization.size &&
          ci.customization.milk === effectiveCustomization.milk &&
          ci.customization.sweetness === effectiveCustomization.sweetness &&
          ci.customization.temperature === effectiveCustomization.temperature &&
          ci.customization.extraShot === effectiveCustomization.extraShot &&
          ci.customization.notes === effectiveCustomization.notes
      );

      if (matchIndex !== -1) {
        const next = [...prevCart];
        const currentItem = next[matchIndex];
        const newQty = currentItem.quantity + 1;
        next[matchIndex] = {
          ...currentItem,
          quantity: newQty,
          totalPrice: currentItem.unitPrice * newQty,
        };
        return next;
      }

      const newCartItem: CartItem = {
        cartItemId: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product,
        quantity: 1,
        customization: effectiveCustomization,
        unitPrice: effectiveUnitPrice,
        totalPrice: effectiveUnitPrice,
      };
      return [...prevCart, newCartItem];
    });

    setCustomizingProduct(null);
  }, []);

  const handleUpdateCartItemQty = useCallback((cartItemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const handleRemoveCartItem = useCallback((cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Checkout handling
  const handleOpenCheckout = (rate: number, name?: string) => {
    setCheckoutDiscount({ rate, name });
    setIsCheckoutOpen(true);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const cartDiscountAmount = useMemo(() => {
    return cartSubtotal * checkoutDiscount.rate;
  }, [cartSubtotal, checkoutDiscount]);

  const cartTax = useMemo(() => {
    const taxable = Math.max(0, cartSubtotal - cartDiscountAmount);
    return taxable * 0.07;
  }, [cartSubtotal, cartDiscountAmount]);

  const cartFinalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscountAmount + cartTax);
  }, [cartSubtotal, cartDiscountAmount, cartTax]);

  const handleCompleteOrder = useCallback((orderData: Parameters<typeof storageService.createOrder>[0]) => {
    const newOrder = storageService.createOrder(orderData);
    setOrders(storageService.getOrders());
    setCart([]);
    setIsCheckoutOpen(false);

    // Open receipt modal with print trigger capability
    setReceiptOrder(newOrder);
    setIsReceiptNew(true);
  }, []);

  // Product CRUD
  const handleAddProduct = useCallback((newProduct: Omit<Product, 'id'>) => {
    storageService.addProduct(newProduct);
    setProducts(storageService.getProducts());
  }, []);

  const handleUpdateProduct = useCallback((updated: Product) => {
    storageService.updateProduct(updated);
    setProducts(storageService.getProducts());
  }, []);

  const handleDeleteProduct = useCallback((id: string) => {
    storageService.deleteProduct(id);
    setProducts(storageService.getProducts());
  }, []);

  const handleResetProducts = useCallback(() => {
    const defaultProds = storageService.resetProducts();
    setProducts(defaultProds);
  }, []);

  // Order status update
  const handleUpdateOrderStatus = useCallback((orderId: string, status: 'Completed' | 'Refunded') => {
    storageService.updateOrderStatus(orderId, status);
    setOrders(storageService.getOrders());
  }, []);

  const handleResetOrders = useCallback(() => {
    const sampleOrders = storageService.resetOrders();
    setOrders(sampleOrders);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100 font-sans text-stone-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartItemCount={totalCartItemCount}
        todayRevenue={todayRevenue}
        todayOrderCount={todayOrderCount}
      />

      {/* Main View Router */}
      <main className="flex-1 flex overflow-hidden">
        {currentPage === 'pos' && (
          <POSPage
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartItemQty={handleUpdateCartItemQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenCheckout={handleOpenCheckout}
            onOpenCustomizer={setCustomizingProduct}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            orders={orders}
            products={products}
            onViewReceipt={(order) => {
              setReceiptOrder(order);
              setIsReceiptNew(false);
            }}
            onNavigateToPOS={() => setCurrentPage('pos')}
            onResetData={handleResetOrders}
          />
        )}

        {currentPage === 'menu' && (
          <MenuPage
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetProducts={handleResetProducts}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            orders={orders}
            onViewReceipt={(order) => {
              setReceiptOrder(order);
              setIsReceiptNew(false);
            }}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Customizer Modal */}
      {customizingProduct && (
        <CustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onConfirm={handleAddToCart}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={cart}
          subtotal={cartSubtotal}
          tax={cartTax}
          discount={cartDiscountAmount}
          discountName={checkoutDiscount.name}
          total={cartFinalTotal}
          onClose={() => setIsCheckoutOpen(false)}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {/* Thermal Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => {
            setReceiptOrder(null);
            setIsReceiptNew(false);
          }}
          isNewOrder={isReceiptNew}
        />
      )}
    </div>
  );
}
