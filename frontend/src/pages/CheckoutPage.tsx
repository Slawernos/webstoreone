import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ShoppingBag, ArrowLeft, Calendar } from 'lucide-react';
import axios from 'axios';
import { Header } from '../components/Header';
import { useCart } from '../hooks/useCart';
import { API_BASE_URL } from '../lib/apiBase';

const api = axios.create({
  baseURL: API_BASE_URL,
});

function addWorkdays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function CheckoutPage() {
  const { getToken } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    const today = new Date();
    const earliest = addWorkdays(today, 3);
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const dates: Date[] = [];
    const current = new Date(earliest);
    while (current <= twoWeeksLater) {
      const dow = current.getDay();
      if (dow !== 0 && dow !== 6) dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      await api.post(
        '/api/orders',
        {
          shipping_address: address,
          phone: phone.trim() || undefined,
          delivery_date: deliveryDate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await clearCart();
      navigate('/rendeleseim');
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.error ?? 'Hiba a rendelés leadásakor'
          : 'Hiba a rendelés leadásakor';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Vissza
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Rendelés leadása</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">A kosarad üres</p>
            <button
              onClick={() => navigate('/termekek')}
              className="mt-4 text-emerald-600 hover:underline text-sm"
            >
              Böngéssz a termékek között
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Kosár összesítő */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Kosár tartalma</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(Number(item.product.price) * item.quantity).toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Összesen</span>
                <span className="text-emerald-600">{total.toLocaleString('hu-HU')} Ft</span>
              </div>
            </div>

            {/* Szállítási adatok form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-semibold text-gray-900">Szállítási adatok</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Szállítási cím *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  placeholder="Város, utca, házszám, irányítószám"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Kért szállítási nap
                  <span className="text-xs text-gray-400 font-normal ml-1">(10:00–18:00, munkanapokon)</span>
                </label>
                <select
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Válassz napot...</option>
                  {availableDates.map((d) => (
                    <option key={isoDate(d)} value={isoDate(d)}>
                      {formatDate(d)}
                    </option>
                  ))}
                </select>
                {availableDates.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Nincs elérhető szállítási nap a következő 2 hétben.</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Feldolgozás...' : 'Rendelés leadása'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
