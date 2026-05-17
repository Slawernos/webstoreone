import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import type { Product } from '../types';
import { API_BASE_URL } from '../lib/apiBase';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const GUEST_CART_KEY = 'petshop_guest_cart_v1';

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

interface GuestCartStoredItem {
  product: Product;
  quantity: number;
}

function readGuestCart(): GuestCartStoredItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartStoredItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: GuestCartStoredItem[]) {
  if (typeof window === 'undefined') return;
  if (items.length === 0) {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return;
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function toStateItems(guestItems: GuestCartStoredItem[]): CartItem[] {
  return guestItems.map((item) => ({
    id: -item.product.id,
    user_id: 0,
    product_id: item.product.id,
    quantity: item.quantity,
    product: item.product,
  }));
}

function totalFromItems(items: CartItem[]) {
  return Number(
    items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2)
  );
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

  const setStateFromGuest = useCallback(() => {
    const guestItems = toStateItems(readGuestCart());
    setState({
      items: guestItems,
      total: totalFromItems(guestItems),
      loading: false,
      error: null,
    });
  }, []);

  const fetchCart = useCallback(async () => {
    if (!isSignedIn) {
      setStateFromGuest();
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const headers = await authHeaders();
      const { data } = await api.get('/api/cart', { headers });
      setState({ items: data.items, total: data.total, loading: false, error: null });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Kosár betöltési hiba' }));
    }
  }, [isSignedIn, authHeaders, setStateFromGuest]);

  useEffect(() => {
    if (!isSignedIn) {
      setStateFromGuest();
      return;
    }

    let cancelled = false;

    const mergeGuestCart = async () => {
      const guestItems = readGuestCart();
      if (guestItems.length === 0) {
        await fetchCart();
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const headers = await authHeaders();
        for (const item of guestItems) {
          await api.post(
            '/api/cart',
            { product_id: item.product.id, quantity: item.quantity },
            { headers }
          );
        }
        writeGuestCart([]);
        if (!cancelled) {
          await fetchCart();
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: 'Kosár szinkronizálási hiba' }));
        }
      }
    };

    mergeGuestCart();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, authHeaders, fetchCart, setStateFromGuest]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, product?: Product) => {
      if (!isSignedIn) {
        const guestItems = readGuestCart();
        const existing = guestItems.find((item) => item.product.id === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          const fallbackProduct = state.items.find((item) => item.product.id === productId)?.product;
          const productToStore = product ?? fallbackProduct;
          if (!productToStore) {
            throw new Error('Termék nem található');
          }
          guestItems.push({ product: productToStore, quantity });
        }
        writeGuestCart(guestItems);
        setStateFromGuest();
        return;
      }

      const headers = await authHeaders();
      await api.post('/api/cart', { product_id: productId, quantity }, { headers });
      await fetchCart();
    },
    [isSignedIn, authHeaders, fetchCart, setStateFromGuest, state.items]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!isSignedIn) {
        const guestItems = readGuestCart();
        const nextItems =
          quantity === 0
            ? guestItems.filter((item) => item.product.id !== productId)
            : guestItems.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
              );
        writeGuestCart(nextItems);
        setStateFromGuest();
        return;
      }

      const current = state.items.find((item) => item.product_id === productId);
      if (!current) return;
      const headers = await authHeaders();
      await api.put(`/api/cart/${current.id}`, { quantity }, { headers });
      await fetchCart();
    },
    [isSignedIn, authHeaders, fetchCart, setStateFromGuest, state.items]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      await updateQuantity(productId, 0);
    },
    [updateQuantity]
  );

  const clearCart = useCallback(async () => {
    if (!isSignedIn) {
      writeGuestCart([]);
      setState({ items: [], total: 0, loading: false, error: null });
      return;
    }
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
