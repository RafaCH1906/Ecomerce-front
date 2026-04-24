import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateUser = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await usersApi.post('/users', {
        nombre,
        email,
        telefono: telefono || null,
        password,
        role,
        activo: true,
      });
      setSuccess(role === 'admin' ? 'Admin creado exitosamente' : 'Usuario creado exitosamente');
      setNombre('');
      setEmail('');
      setTelefono('');
      setPassword('');
      setRole('admin');
    } catch (err) {
      const backendDetail = err?.response?.data?.detail;
      setError(typeof backendDetail === 'string' ? backendDetail : 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 glass rounded-3xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Acceso restringido</h2>
        <p className="text-slate-300 mb-6">Solo el superadmin puede crear administradores.</p>
        <Link to="/admin" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-semibold transition-all">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 glass rounded-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Crear Usuario/Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Correo" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Teléfono (opcional)" value={telefono} onChange={e => setTelefono(e.target.value)} />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <select className="w-full p-3 rounded-xl bg-midnight-900 text-white" value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="user">Usuario</option>
        </select>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        {success && <div className="text-green-400 mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default CreateUser;
