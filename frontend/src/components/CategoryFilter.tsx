import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-brand text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Összes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat.id
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
