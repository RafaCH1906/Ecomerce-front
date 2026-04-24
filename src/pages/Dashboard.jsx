import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Navbar from '../components/Navbar';
import { analyticsApi } from '../services/api';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [salesByDate, setSalesByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const [totalRes, salesRes, productsRes, usersRes] = await Promise.all([
          analyticsApi.get('/analytics/total-sales'),
          analyticsApi.get('/analytics/sales-by-date'),
          analyticsApi.get('/analytics/top-products'),
          analyticsApi.get('/analytics/top-users'),
        ]);

        const total = totalRes.data?.[0]?.total_ventas;
        setTotalSales(toNumber(total));

        setSalesByDate(
          (salesRes.data || []).map((item) => ({
            fecha: item.fecha,
            ventas: toNumber(item.ventas_diarias),
          }))
        );

        setTopProducts(
          (productsRes.data || []).map((item) => ({
            nombre: item.nombre,
            total: toNumber(item.total_vendido),
          }))
        );

        setTopUsers(
          (usersRes.data || []).map((item) => ({
            userId: item.user_id,
            compras: toNumber(item.numero_compras),
            gasto: toNumber(item.total_gastado),
          }))
        );
      } catch (err) {
        setError('No se pudo cargar la analítica. Verifica analytics-service.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const salesChartData = useMemo(() => salesByDate.slice().reverse(), [salesByDate]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">KPIs y tendencias desde analytics-service.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="glass h-32 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {error && <div className="mb-6 bg-red-600/90 text-white px-4 py-3 rounded-xl">{error}</div>}

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <article className="glass rounded-3xl p-6">
                <p className="text-slate-400 text-sm">Ventas Totales</p>
                <p className="text-white text-3xl font-bold mt-2">S/{totalSales.toFixed(2)}</p>
              </article>

              <article className="glass rounded-3xl p-6">
                <p className="text-slate-400 text-sm">Días con Ventas</p>
                <p className="text-white text-3xl font-bold mt-2">{salesByDate.length}</p>
              </article>

              <article className="glass rounded-3xl p-6">
                <p className="text-slate-400 text-sm">Top Productos</p>
                <p className="text-white text-3xl font-bold mt-2">{topProducts.length}</p>
              </article>

              <article className="glass rounded-3xl p-6">
                <p className="text-slate-400 text-sm">Top Usuarios</p>
                <p className="text-white text-3xl font-bold mt-2">{topUsers.length}</p>
              </article>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              <article className="glass rounded-3xl p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Ventas por Fecha</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="fecha" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="ventas" stroke="#6366F1" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="glass rounded-3xl p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Top Productos</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="nombre" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip />
                      <Bar dataKey="total" fill="#22C55E" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="glass rounded-3xl p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Top Usuarios</h2>
              <div className="overflow-auto">
                <table className="w-full text-left text-white">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Compras</th>
                      <th className="p-2">Total Gastado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((item) => (
                      <tr key={item.userId} className="border-b border-slate-800">
                        <td className="p-2">ID {item.userId}</td>
                        <td className="p-2">{item.compras}</td>
                        <td className="p-2">S/{item.gasto.toFixed(2)}</td>
                      </tr>
                    ))}
                    {topUsers.length === 0 && (
                      <tr>
                        <td className="p-2 text-slate-400" colSpan={3}>Sin datos disponibles.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
