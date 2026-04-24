import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCartCount } from '../services/cart';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(getCartCount());

  useEffect(() => {
    const refreshCartCount = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', refreshCartCount);
    window.addEventListener('storage', refreshCartCount);
    refreshCartCount();

    return () => {
      window.removeEventListener('cart-updated', refreshCartCount);
      window.removeEventListener('storage', refreshCartCount);
    };
  }, []);

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
            Nexus E-commerce
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/products" className="text-slate-300 hover:text-white transition-colors">Catálogo</Link>
          

          {/* Enlace oculto al panel admin para admin y superadmin */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link to="/admin" className="group relative ml-2">
              <span className="sr-only">Panel Admin</span>
              <Lock className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 opacity-60 hover:opacity-100 transition-opacity" />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-midnight-900 text-indigo-300 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Panel Admin</span>
            </Link>
          )}

          {/* Historial de compras para usuarios logueados */}
          {user && (
            <button
              onClick={() => navigate('/order-history')}
              className="text-slate-300 hover:text-white transition-colors text-sm"
            >
              Mis Compras
            </button>
          )}

          <div className="h-6 w-px bg-white/10" />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-200">{user.nombre}</span>
              </div>
              <button 
                onClick={() => { logout(); navigate('/products'); }}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Iniciar Sesión
            </Link>
          )}
          
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 text-[10px] flex items-center justify-center rounded-full border-2 border-midnight-950">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
