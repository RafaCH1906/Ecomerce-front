import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCartItems, clearCart } from '../services/cart';
import { ordersApi } from '../services/api';

const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';

const Checkout = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCartItems());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: '',
    pais: 'Perú',
    codigo_postal: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    const refresh = () => setItems(getCartItems());
    window.addEventListener('cart-updated', refresh);
    return () => window.removeEventListener('cart-updated', refresh);
  }, [navigate]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.precio || 0) * (item.quantity || 0), 0),
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-20">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al carrito
          </button>
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-slate-300 text-lg mb-4">Tu carrito está vacío.</p>
            <button
              onClick={() => navigate('/products')}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Ir al catálogo
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.direccion.trim() || !formData.ciudad.trim() || !formData.codigo_postal.trim()) {
      setError('Por favor completa todos los campos de dirección.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        user_id: user.id,
        productos: items.map((item) => ({
          product_id: item.id,
          nombre: item.nombre,
          precio_unitario: item.precio,
          cantidad: item.quantity || 1,
          subtotal: (item.precio || 0) * (item.quantity || 1),
        })),
        total,
        direccion_envio: {
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          pais: formData.pais,
          codigo_postal: formData.codigo_postal,
        },
      };

      const response = await ordersApi.post('/orders', orderPayload);

      clearCart();
      setSuccessMessage('¡Compra confirmada exitosamente!');
      
      setTimeout(() => {
        navigate(`/order-confirmation/${response.data._id}`);
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al procesar la compra';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver al carrito
        </button>

        <header className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Confirmar Compra</h2>
          <p className="text-slate-400">Revisa tu orden y completa la dirección de envío.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de dirección */}
          <section className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">Dirección de Envío</h3>

              <div className="space-y-5">
                <div>
                  <label htmlFor="direccion" className="block text-slate-300 font-medium mb-2">
                    Calle y Número *
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Avenida Principal 123"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="ciudad" className="block text-slate-300 font-medium mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ej: Lima"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pais" className="block text-slate-300 font-medium mb-2">
                      País
                    </label>
                    <select
                      id="pais"
                      name="pais"
                      value={formData.pais}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Perú">Perú</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Chile">Chile</option>
                      <option value="Argentina">Argentina</option>
                      <option value="México">México</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="codigo_postal" className="block text-slate-300 font-medium mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="codigo_postal"
                      name="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={handleInputChange}
                      placeholder="Ej: 15001"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mt-5 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </form>
          </section>

          {/* Resumen de la orden */}
          <aside className="glass rounded-3xl p-6 h-fit">
            <h3 className="text-2xl font-semibold text-white mb-6">Resumen de Orden</h3>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="pb-4 border-b border-white/10 flex gap-3"
                >
                  <img
                    src={item.imageUrl || PRODUCT_PLACEHOLDER}
                    onError={(e) => {
                      e.currentTarget.src = PRODUCT_PLACEHOLDER;
                    }}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.nombre}</p>
                    <p className="text-slate-400 text-sm">
                      {item.quantity || 1} × S/{Number(item.precio || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-white font-semibold whitespace-nowrap">
                    S/{((item.precio || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>S/{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Envío</span>
                <span className="text-green-400">Gratis</span>
              </div>
              <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
                <span>Total</span>
                <span>S/{total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
