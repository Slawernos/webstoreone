export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  category_id?: number;
  category?: Category;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
