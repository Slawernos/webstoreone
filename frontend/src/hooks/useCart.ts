import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import type { Product } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useCart() {
  const { getToken, isSignedIn } = useAuth();
  const [state, setState] = useState<CartState>({
    items: [],
    total: 0,
    loading: false,
    error: null,
  });

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const fetchCart = useCallback(async () => {
    if (!isSignedIn) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const headers = await authHeaders();
      const { data } = await api.get('/api/cart', { headers });
      setState({ items: data.items, total: data.total, loading: false, error: null });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Kosár betöltési hiba' }));
    }
  }, [isSignedIn, authHeaders]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!isSignedIn) return;
      const headers = await authHeaders();
      await api.post('/api/cart', { product_id: productId, quantity }, { headers });
      await fetchCart();
    },
    [isSignedIn, authHeaders, fetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!isSignedIn) return;
      const headers = await authHeaders();
      await api.put(`/api/cart/${itemId}`, { quantity }, { headers });
      await fetchCart();
    },
    [isSignedIn, authHeaders, fetchCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!isSignedIn) return;
      const headers = await authHeaders();
      await api.delete(`/api/cart/${itemId}`, { headers });
      await fetchCart();
    },
    [isSignedIn, authHeaders, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (!isSignedIn) return;
    const headers = await authHeaders();
    await api.delete('/api/cart', { headers });
    setState({ items: [], total: 0, loading: false, error: null });
  }, [isSignedIn, authHeaders]);

  return {
    ...state,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart,
    itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
