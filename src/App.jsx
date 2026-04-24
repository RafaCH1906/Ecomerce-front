
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import CreateUser from './pages/CreateUser';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder de Dashboard real (puedes reemplazar luego)
const Dashboard = () => <div className="p-10 text-white font-bold text-3xl">Dashboard de Analítica (KPI, gráficas, tops...)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ruta pública: Catálogo */}
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          

          {/* Ruta protegida: Solo Admin */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          
          {/* Redirigir la raíz al catálogo público */}
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
