import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { Header } from '../components/Header';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(Number(id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {loading && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-white rounded-xl shadow-sm" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-12 bg-gray-200 rounded w-1/2 mt-8" />
            </div>
          </div>
        </div>
      )}

      {(error || (!loading && !product)) && (
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 text-lg">Termek nem talalhato</p>
          <Link to="/termekek" className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Vissza a termekekhez
          </Link>
        </div>
      )}

      {!loading && product && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Fooldal</Link>
            <span>/</span>
            <Link to="/termekek" className="hover:text-emerald-600 transition-colors">Termekek</Link>
            {product.category && (
              <>
                <span>/</span>
                <span className="text-gray-700">{product.category.name}</span>
              </>
            )}
          </nav>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-9xl">🐾</span>
                )}
              </div>

              <div className="p-8 flex flex-col">
                {product.category && (
                  <span className="text-sm text-emerald-600 font-medium">{product.category.name}</span>
                )}
                <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

                <div className="flex items-center gap-1 mt-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">4.0</span>
                </div>

                {product.description && (
                  <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-auto pt-8">
                  <div className="text-4xl font-bold text-emerald-600">
                    {Number(product.price).toLocaleString('hu-HU')} Ft
                  </div>
                  <div className="mt-2 text-sm">
                    {product.stock === 0 ? (
                      <span className="text-red-500 font-medium">Elfogyott</span>
                    ) : product.stock < 5 ? (
                      <span className="text-amber-500 font-medium">Csak {product.stock} db maradt!</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Raktaron ({product.stock} db)</span>
                    )}
                  </div>
                  <button
                    disabled={product.stock === 0}
                    className="mt-6 flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0 ? 'Elfogyott' : 'Kosarba'}
                  </button>
                  <Link
                    to="/termekek"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Vissza a termekekhez
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
