import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onSearchChange: (query: string) => void;
}

export function Header({ cartCount, onCartClick, onSearchChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="font-semibold text-xl text-emerald-600">PetShop Pro</h1>

            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">Shop</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">About</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">Contact</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Home</a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Shop</a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">About</a>
              <a href="#" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Contact</a>
              <div className="px-4 py-2 sm:hidden relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
