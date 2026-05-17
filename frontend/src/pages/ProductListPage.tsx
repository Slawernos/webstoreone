import { useState } from 'react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';

export function ProductListPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, loading, error } = useProducts({
    page,
    limit: 12,
    category_id: selectedCategory ?? undefined,
    search: search || undefined,
  });

  const { categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategory(id);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero sáv */}
      <div className="bg-brand text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Termékeink</h1>
          <p className="text-brand-light opacity-90">Minden, ami a kedvencednek kell</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Keresés */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Termék keresése..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Keresés
          </button>
        </form>

        {/* Kategória szűrő */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Tartalom */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {!loading && !error && data && (
          <>
            {data.products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">Nincs találat</p>
                <p className="text-sm mt-1">Próbálj más keresési feltételeket</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Lapozó */}
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
  );
}
