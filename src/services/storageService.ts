import { Product, Order } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';

const PRODUCTS_STORAGE_KEY = 'baristapro_products_v1';
const ORDERS_STORAGE_KEY = 'baristapro_orders_v1';

export const storageService = {
  // Products API
  getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('baristapro_products_updated'));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  addProduct(newProduct: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const id = Date.now().toString();
    const product: Product = { ...newProduct, id };
    products.unshift(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(updated: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      products[index] = updated;
      this.saveProducts(products);
    }
    return updated;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
  },

  resetProducts(): Product[] {
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  // Orders API
  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('baristapro_orders_updated'));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const nextNum = 1000 + orders.length + 1;
    const orderNumber = `ORD-${nextNum}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(id: string, status: 'Completed' | 'Refunded'): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      this.saveOrders(orders);
      return order;
    }
    return undefined;
  },

  resetOrders(): Order[] {
    this.saveOrders(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
};
