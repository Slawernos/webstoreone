import { motion } from 'motion/react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const allItems = [
    { id: null as number | null, name: 'Összes termék', icon: '🏪' },
    ...categories.map((cat) => ({ id: cat.id as number | null, name: cat.name, icon: '🐾' })),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold mb-4 text-gray-900">Kategóriák</h3>
      <div className="flex flex-col gap-2">
        {allItems.map((item) => (
          <button
            key={item.id ?? 'all'}
            onClick={() => onSelect(item.id)}
            className={`relative px-4 py-3 rounded-lg text-left transition-colors ${
              selected === item.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {selected === item.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-emerald-50 rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
