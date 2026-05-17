import type { Category } from './components/CategoryFilter';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  emoji: string;
  rating: number;
  unit: string;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
