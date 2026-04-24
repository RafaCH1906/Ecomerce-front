import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../services/cart';

const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';

const Cart = () => {
  const [items, setItems] = useState(getCartItems());
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setItems(getCartItems());
    window.addEventListener('cart-updated', refresh);
    window.addEventListener('storage', refresh);
    refresh();

    return () => {
      window.removeEventListener('cart-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.precio || 0) * (item.quantity || 0), 0),
    [items]
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <header className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Tu Carrito</h2>
          <p className="text-slate-400">Revisa y ajusta tus productos antes de comprar.</p>
        </header>

        {items.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-slate-300 text-lg mb-4">Tu carrito está vacío.</p>
            <Link
              to="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 glass rounded-3xl p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex gap-4 items-center"
                  >
                    <img
                      src={item.imageUrl || PRODUCT_PLACEHOLDER}
                      onError={(event) => {
                        event.currentTarget.src = PRODUCT_PLACEHOLDER;
                      }}
                      alt={item.nombre}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{item.nombre}</h3>
                      <p className="text-slate-400 text-sm">S/{Number(item.precio || 0).toFixed(2)} c/u</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) - 1)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center text-white font-semibold">{item.quantity || 1}</span>

                      <button
                        onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) + 1)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <aside className="glass rounded-3xl p-6 h-fit">
              <h3 className="text-white text-xl font-semibold mb-4">Resumen</h3>
              <div className="flex justify-between text-slate-300 mb-2">
                <span>Productos</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-white text-xl font-bold mb-6">
                <span>Total</span>
                <span>S/{total.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all mb-3"
              >
                Continuar compra
              </button>


              <button
                onClick={clearCart}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
