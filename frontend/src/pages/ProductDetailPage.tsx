import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(Number(id));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/3" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-10 bg-gray-100 rounded w-1/3 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Termék nem található</p>
        <Link to="/termekek" className="mt-4 inline-block text-brand hover:underline text-sm">
          ← Vissza a termékekhez
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-brand">Főoldal</Link>
          <span>/</span>
          <Link to="/termekek" className="hover:text-brand">Termékek</Link>
          {product.category && (
            <>
              <span>/</span>
              <span>{product.category.name}</span>
            </>
          )}
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Kép */}
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-24 h-24 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Adatok */}
            <div className="p-8 flex flex-col">
              {product.category && (
                <span className="text-xs text-brand font-medium uppercase tracking-wide">
                  {product.category.name}
                </span>
              )}
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{product.name}</h1>

              {product.description && (
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">{product.description}</p>
              )}

              <div className="mt-auto pt-6">
                <div className="text-3xl font-bold text-gray-900">
                  {Number(product.price).toLocaleString('hu-HU')} Ft
                </div>

                <div className="mt-2 text-sm">
                  {product.stock === 0 ? (
                    <span className="text-red-500">Elfogyott</span>
                  ) : (
                    <span className="text-green-600">Raktáron ({product.stock} db)</span>
                  )}
                </div>

                <button
                  disabled={product.stock === 0}
                  className="mt-6 w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Elfogyott' : 'Kosárba'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
