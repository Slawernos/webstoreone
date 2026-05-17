import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { Header } from '../components/Header';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Függőben',    color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Visszaigazolt', color: 'bg-blue-100 text-blue-800' },
  shipped:   { label: 'Szállítás alatt', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Kézbesítve',  color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Lemondva',    color: 'bg-red-100 text-red-800' },
};

interface OrderItem {
  id: number;
  product: { id: number; name: string; price: string };
  quantity: number;
  unit_price: string;
}

interface Order {
  id: number;
  status: string;
  total_price: string;
  shipping_address: string;
  created_at?: string;
  createdAt?: string;
  phone?: string | null;
  delivery_date?: string | null;
  items: OrderItem[];
}

function formatDateSafe(value?: string | null) {
  if (!value) return 'Nincs megadva';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('hu-HU');
}

export function OrdersPage() {
  const { getToken, isSignedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        const { data } = await api.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, getToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Rendeléseim</h1>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Még nincs rendelésed</p>
            <Link to="/termekek" className="mt-4 inline-block text-emerald-600 hover:underline text-sm">
              Böngéssz a termékek között →
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-800' };
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">#{order.id} rendelés</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateSafe(order.createdAt ?? order.created_at)} ·{' '}
                        <span className="font-medium text-emerald-600">
                          {Number(order.total_price).toLocaleString('hu-HU')} Ft
                        </span>
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t px-6 pb-6 pt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Szállítási cím:</span> {order.shipping_address}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Szállítási nap:</span> {formatDateSafe(order.delivery_date)}
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {(Number(item.unit_price) * item.quantity).toLocaleString('hu-HU')} Ft
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
