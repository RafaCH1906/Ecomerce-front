import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { usersApi } from '../services/api';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await usersApi.post('/users', {
        nombre,
        email,
        telefono: telefono || null,
        password,
        activo: true,
        role: 'user',
      });

      setSuccess('Cuenta creada. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const backendDetail = err?.response?.data?.detail;
      setError(typeof backendDetail === 'string' ? backendDetail : 'No se pudo registrar la cuenta.');
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
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-400 mt-2">Registra tus datos para empezar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Teléfono (opcional)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                maxLength={9}
                pattern="[0-9]{0,9}"
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="999999999"
                value={telefono}
                onChange={(event) => {
                  const onlyDigits = event.target.value.replace(/\D/g, '').slice(0, 9);
                  setTelefono(onlyDigits);
                }}
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
                minLength={6}
                className="w-full bg-midnight-900 border border-white border-opacity-10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-sm text-center">
              {success}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>

          <p className="text-slate-400 text-sm text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Inicia sesión
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;