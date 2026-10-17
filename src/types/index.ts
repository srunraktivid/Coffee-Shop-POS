export type ProductCategory = 'Hot' | 'Iced' | 'Specialty' | 'Bakery';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description?: string;
  image: string;
  available: boolean;
  stock?: number;
  featured?: boolean;
}

export type DrinkSize = 'Regular' | 'Large';
export type MilkType = 'Whole' | 'Oat' | 'Almond' | 'Skim' | 'None';
export type SweetnessLevel = '0% (Unsweetened)' | '25% (Less)' | '50% (Half)' | '100% (Standard)';
export type TemperatureOption = 'Hot' | 'Iced';

export interface Customization {
  size: DrinkSize;
  milk: MilkType;
  sweetness: SweetnessLevel;
  temperature: TemperatureOption;
  extraShot: boolean;
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customization: Customization;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'mobile';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  discountName?: string;
  total: number;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  changeGiven?: number;
  status: 'Completed' | 'Refunded';
  cashier: string;
  customerName?: string;
}

export type NavigationPage = 'pos' | 'dashboard' | 'menu' | 'orders';
