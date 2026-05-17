import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/termekek/${product.id}`}
      className="group block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <span className="text-xs text-brand font-medium uppercase tracking-wide">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-brand transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {Number(product.price).toLocaleString('hu-HU')} Ft
          </span>
          {product.stock === 0 ? (
            <span className="text-xs text-red-500 font-medium">Elfogyott</span>
          ) : product.stock < 5 ? (
            <span className="text-xs text-amber-500 font-medium">Csak {product.stock} db</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">Raktáron</span>
          )}
        </div>
      </div>
    </Link>
  );
}
