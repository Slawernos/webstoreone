import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const allItems = [
    { id: null as number | null, name: 'Összes termék', icon: '🏪' },
    ...categories.map((cat) => ({ id: cat.id as number | null, name: cat.name, icon: '🐾' })),
  ];

  const selectedItem = allItems.find((i) => i.id === selected) ?? allItems[0];

  const handleSelect = (id: number | null) => {
    onSelect(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile: legördülő */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <span className="text-xl">{selectedItem.icon}</span>
            {selectedItem.name}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {allItems.map((item) => (
                <button
                  key={item.id ?? 'all'}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selected === item.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block sticky top-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-4 text-gray-900">Kategóriák</h3>
          <div className="flex flex-col gap-1">
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
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
