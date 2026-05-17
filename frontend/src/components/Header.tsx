import { ShoppingCart, Search, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, UserButton, SignInButton } from '@clerk/react';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  onSearchChange?: (query: string) => void;
}

export function Header({ cartCount = 0, onCartClick, onSearchChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isSignedIn } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchChange?.(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-semibold text-xl text-emerald-600">
              PetShop Pro 🐾
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link to="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Főoldal
              </Link>
              <Link to="/termekek" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Termékek
              </Link>
              {isSignedIn && (
                <Link to="/rendeleseim" className="text-gray-700 hover:text-emerald-600 transition-colors">
                  Rendeléseim
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Keresés..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Kosár"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <LogIn className="w-4 h-4" /> Belépés
                </button>
              </SignInButton>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Főoldal
              </Link>
              <Link
                to="/termekek"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Termékek
              </Link>
              {isSignedIn && (
                <Link
                  to="/rendeleseim"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rendeléseim
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2 w-full text-left"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" /> Belépés
                  </button>
                </SignInButton>
              )}
              <div className="px-4 py-2 sm:hidden relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Keresés..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
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
