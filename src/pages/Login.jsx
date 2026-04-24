import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Lock, Mail } from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState(''); // Usado como username (puede ser email o nombre)
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Enviar como form-data (x-www-form-urlencoded) a /auth/login
      const params = new URLSearchParams();
      params.append('username', email); // Puede ser email o nombre
      params.append('password', password);
      const response = await usersApi.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token } = response.data;
      // Decodificar el JWT para obtener el usuario y rol
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const user = {
        id: payload.userId,
        nombre: payload.sub,
        role: payload.role,
      };
      login(user, access_token);
      navigate(user.role === 'admin' ? '/admin' : '/products');
    } catch (err) {
      setError('Usuario o contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-8 rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-indigo-500 bg-opacity-20 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
          <p className="text-slate-400 mt-2">Ingresa a tu cuenta de E-commerce</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Usuario o Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text"
                required
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="usuario o correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>

          <p className="text-slate-400 text-sm text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Regístrate
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
