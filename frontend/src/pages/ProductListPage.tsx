import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { Cart, type CartItem } from '../components/Cart';
import { Header } from '../components/Header';
import type { Product } from '../types';

export function ProductListPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data, loading, error } = useProducts({
    page,
    limit: 12,
    category_id: selectedCategory ?? undefined,
    search: search || undefined,
  });

  const { categories } = useCategories();

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={(q) => { setSearch(q); setPage(1); }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: kategória szűrő */}
          <aside className="lg:col-span-1">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </aside>

          {/* Termékek */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="font-semibold text-2xl text-gray-900">
                {selectedCategory === null
                  ? 'Összes termék'
                  : categories.find((c) => c.id === selectedCategory)?.name ?? 'Termékek'}
              </h2>
              {data && (
                <p className="text-gray-600 mt-1">
                  {data.total} {data.total === 1 ? 'termék' : 'termék'} található
                </p>
              )}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-white shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-t-xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-red-500">
                {error}
              </div>
            )}

            {!loading && !error && data && (
              <>
                {data.products.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500 font-medium">Nincs találat</p>
                    <p className="text-sm text-gray-400 mt-2">Próbálj más keresési feltételeket</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {data.products.map((p) => (
                        <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                      ))}
                    </div>
                  </AnimatePresence>
                )}

                {data.totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    >
                      ← Előző
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      {page} / {data.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    >
                      Következő →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.product.id !== id))}
      />
    </div>
  );
}
