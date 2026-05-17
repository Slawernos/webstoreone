import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {product.emoji}
        </div>
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-lg text-emerald-600">${product.price}</span>
            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.inStock === false}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
