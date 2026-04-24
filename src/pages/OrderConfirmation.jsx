import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, History } from 'lucide-react';
import Navbar from '../components/Navbar';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-20 flex items-center justify-center">
          <div className="text-slate-300">Procesando confirmación...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="glass rounded-3xl p-12 text-center">
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold text-white mb-2">¡Compra Confirmada!</h1>
          <p className="text-slate-400 mb-8 text-lg">
            Tu orden ha sido procesada correctamente.
          </p>

          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-slate-300 text-sm mb-1">Número de Orden</p>
            <p className="text-white text-2xl font-bold font-mono">
              #{orderId?.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left bg-slate-900/30 rounded-2xl p-6 border border-white/5">
            <p className="text-slate-300">
              ✓ Orden creada correctamente
            </p>
            <p className="text-slate-300">
              ✓ Se enviará un email de confirmación
            </p>
            <p className="text-slate-300">
              ✓ Tu envío será procesado en 1-2 días hábiles
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/order-history')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              Ver Mis Compras
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Volver al Catálogo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
