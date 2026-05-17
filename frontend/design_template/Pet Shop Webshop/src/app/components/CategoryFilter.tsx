import { motion } from 'motion/react';

export type Category = 'all' | 'main-food' | 'exotic-food' | 'equipment' | 'live-food' | 'live-animals';

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories = [
  { id: 'all' as Category, label: 'All Products', icon: '🏪' },
  { id: 'main-food' as Category, label: 'Pet Food (Main)', icon: '🍖' },
  { id: 'exotic-food' as Category, label: 'Exotic Pet Food', icon: '🦎' },
  { id: 'equipment' as Category, label: 'Equipment', icon: '🎾' },
  { id: 'live-food' as Category, label: 'Live Food', icon: '🦗' },
  { id: 'live-animals' as Category, label: 'Live Animals', icon: '🐾' },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold mb-4 text-gray-900">Categories</h3>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`relative px-4 py-3 rounded-lg text-left transition-colors ${
              selectedCategory === category.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {selectedCategory === category.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-emerald-50 rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <span className="font-medium">{category.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
