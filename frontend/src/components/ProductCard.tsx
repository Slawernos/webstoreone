import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

const EMOJIS: Record<string, string> = {
  food: '🍖',
  toy: '🎾',
  bed: '🛏️',
  collar: '🦮',
  fish: '🐟',
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🐦',
};

function getEmoji(product: Product): string {
  const name = product.name.toLowerCase();
  if (name.includes('kutya') || name.includes('dog')) return '🐶';
  if (name.includes('macska') || name.includes('cat')) return '🐱';
  if (name.includes('hal') || name.includes('fish')) return '🐟';
  if (name.includes('nyúl') || name.includes('rabbit')) return '🐰';
  if (name.includes('madár') || name.includes('bird')) return '🐦';
  if (name.includes('játék') || name.includes('toy')) return '🎾';
  if (name.includes('ágy') || name.includes('bed')) return '🛏️';
  const catName = product.category?.name?.toLowerCase() ?? '';
  return EMOJIS[catName] ?? '🐾';
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
      onClick={() => navigate(`/termekek/${product.id}`)}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {getEmoji(product)}
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Elfogyott
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-gray-700">4.5</span>
          </div>
        </div>

        {product.category && (
          <p className="text-xs text-emerald-600 font-medium mb-2">{product.category.name}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg text-emerald-600">
            {Number(product.price).toLocaleString('hu-HU')} Ft
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Kosár
          </button>
        </div>
      </div>
    </motion.div>
  );
}
