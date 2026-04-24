import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Package, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { aggregatorApi } from '../services/api';

const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';
const STATUS_COLORS = {
  pendiente: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  pagado: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  enviado: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  completado: 'bg-green-500/20 text-green-300 border-green-500/50',
  cancelado: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchOrderHistory(userData.id || userData.userId);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchOrderHistory = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const response = await aggregatorApi.get(`/aggregator/user/${userId}/full-profile`);

      // Soporta ambos formatos de respuesta: { ordenes: [] } y { resumen_actividad: { ordenes: [] } }
      const aggregatedOrders = response.data?.resumen_actividad?.ordenes;
      const directOrders = response.data?.ordenes;
      const normalizedOrders = Array.isArray(aggregatedOrders)
        ? aggregatedOrders
        : Array.isArray(directOrders)
          ? directOrders
          : [];

      setOrders(normalizedOrders);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message;
      setError(errorMsg || 'Error al cargar el historial de compras');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-20 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-400" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <header className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Mi Historial de Compras</h2>
          <p className="text-slate-400">
            Aquí puedes ver todas tus órdenes y sus detalles.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-300 text-lg mb-4">No tienes órdenes aún.</p>
            <button
              onClick={() => navigate('/products')}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Ir al catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id || order.id} className="glass rounded-3xl overflow-hidden">
                {/* Header de orden */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === (order._id || order.id) ? null : (order._id || order.id))}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div>
                      <p className="text-white font-semibold">Orden #{(order._id || order.id || 'N/A').toString().slice(-8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.fecha || order.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-slate-300 text-sm">Total</p>
                      <p className="text-white font-bold text-lg">S/{Number(order.total || 0).toFixed(2)}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                        STATUS_COLORS[order.estado?.toLowerCase()] || 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {order.estado?.charAt(0).toUpperCase() + order.estado?.slice(1)}
                    </div>
                  </div>
                </button>

                {/* Detalles expandibles */}
                {expandedOrder === (order._id || order.id) && (
                  <div className="border-t border-white/10 px-6 py-4 space-y-6">
                    {/* Productos */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">Productos</h4>
                      <div className="space-y-3">
                        {order.productos?.map((producto, idx) => (
                          (() => {
                            const productDetail = producto.detalle_producto || producto.detalle_completo || {};
                            const quantity = Number(producto.cantidad || 1);
                            const unitPrice = Number(producto.precio_unitario ?? producto.precio_unitario_en_orden ?? 0);
                            const subtotal = Number(producto.subtotal ?? unitPrice * quantity);
                            const productName = producto.nombre || productDetail.nombre || `Producto ${producto.product_id || ''}`;
                            const imageUrl = producto.imageUrl || productDetail.imageUrl || productDetail.imagenUrl || PRODUCT_PLACEHOLDER;

                            return (
                          <div
                            key={idx}
                            className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex gap-4"
                          >
                            <div className="w-16 h-16 bg-slate-800 rounded-lg shrink-0 overflow-hidden">
                              <img
                                src={imageUrl}
                                onError={(e) => {
                                  e.currentTarget.src = PRODUCT_PLACEHOLDER;
                                }}
                                alt={productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium">{productName}</p>
                              <p className="text-slate-400 text-sm">
                                {quantity} × S/{unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <p className="text-white font-semibold whitespace-nowrap">
                              S/{subtotal.toFixed(2)}
                            </p>
                          </div>
                            );
                          })()
                        ))}
                      </div>
                    </div>

                    {/* Dirección de envío */}
                    {order.direccion_envio && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-5 h-5 text-indigo-400" />
                          <h4 className="text-white font-semibold">Dirección de Envío</h4>
                        </div>
                        <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4 text-slate-300">
                          <p>{order.direccion_envio.direccion}</p>
                          <p>
                            {order.direccion_envio.ciudad}, {order.direccion_envio.pais}
                          </p>
                          <p>CP: {order.direccion_envio.codigo_postal}</p>
                        </div>
                      </div>
                    )}

                    {/* Resumen financiero */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between text-slate-300 mb-2">
                        <span>Subtotal</span>
                        <span>S/{Number(order.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 mb-4">
                        <span>Envío</span>
                        <span className="text-green-400">Gratis</span>
                      </div>
                      <div className="flex justify-between text-white text-lg font-bold border-t border-white/10 pt-4">
                        <span>Total</span>
                        <span>S/{Number(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;
