import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../components/Header';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

interface Stats {
  productCount: number;
  orderCount: number;
  userCount: number;
  pendingOrders: number;
}

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  is_active: boolean;
  category?: { name: string };
}

interface OrderItem {
  id: number;
  product: { name: string };
  quantity: number;
  unit_price: string;
}

interface Order {
  id: number;
  status: string;
  total_price: string;
  shipping_address: string;
  created_at: string;
  user?: { email: string; first_name: string; last_name: string };
  items: OrderItem[];
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Függőben',
  confirmed: 'Visszaigazolt',
  shipped: 'Szállítás',
  delivered: 'Kézbesítve',
  cancelled: 'Lemondva',
};
const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

type Tab = 'stats' | 'products' | 'orders';

export function AdminPage() {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  // Adatok betöltése tab szerint
  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);
    (async () => {
      try {
        const headers = await authHeaders();
        if (tab === 'stats') {
          const { data } = await api.get('/api/admin/stats', { headers });
          setStats(data);
        } else if (tab === 'products') {
          const { data } = await api.get('/api/admin/products', { headers });
          setProducts(data);
        } else {
          const { data } = await api.get('/api/admin/orders', { headers });
          setOrders(data);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isSignedIn]);

  const toggleActive = async (product: Product) => {
    const headers = await authHeaders();
    await api.put(`/api/admin/products/${product.id}`, { is_active: !product.is_active }, { headers });
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  };

  const changeStatus = async (orderId: number, status: string) => {
    const headers = await authHeaders();
    await api.put(`/api/admin/orders/${orderId}/status`, { status }, { headers });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin panel</h1>

        {/* Tab navigáció */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 w-fit">
          {(['stats', 'products', 'orders'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {{ stats: 'Dashboard', products: 'Termékek', orders: 'Rendelések' }[t]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Betöltés...
          </div>
        )}

        {/* DASHBOARD */}
        {!loading && tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Aktív termékek', value: stats.productCount, color: 'text-emerald-600' },
              { label: 'Összes rendelés', value: stats.orderCount, color: 'text-blue-600' },
              { label: 'Felhasználók', value: stats.userCount, color: 'text-purple-600' },
              { label: 'Függő rendelés', value: stats.pendingOrders, color: 'text-yellow-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* TERMÉKEK */}
        {!loading && tab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Termék</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategória</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Ár</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Készlet</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Állapot</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '–'}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {Number(p.price).toLocaleString('hu-HU')} Ft
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{p.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          p.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.is_active ? 'Aktív' : 'Inaktív'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nincs termék</p>
            )}
          </div>
        )}

        {/* RENDELÉSEK */}
        {!loading && tab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vásárló</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Dátum</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Összeg</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Státusz</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {o.user ? `${o.user.first_name} ${o.user.last_name}`.trim() || o.user.email : '–'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(o.created_at).toLocaleDateString('hu-HU')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {Number(o.total_price).toLocaleString('hu-HU')} Ft
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nincs rendelés</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
