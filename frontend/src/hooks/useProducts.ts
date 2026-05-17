import axios from 'axios';
import { useState, useEffect } from 'react';
import type { Product, ProductsResponse, Category } from '../types';
import { API_BASE_URL } from '../lib/apiBase';

const api = axios.create({
  baseURL: API_BASE_URL,
});

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.category_id) params.set('category_id', String(options.category_id));
    if (options.search) params.set('search', options.search);

    api
      .get<ProductsResponse>(`/api/products?${params}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Nem sikerült betölteni a termékeket'))
      .finally(() => setLoading(false));
  }, [options.page, options.limit, options.category_id, options.search]);

  return { data, loading, error };
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<Product>(`/api/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => setError('Termék nem található'))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Category[]>('/api/categories')
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
