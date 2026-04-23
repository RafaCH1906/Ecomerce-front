import { useState } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateUser = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
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
        password,
        role,
        activo: true,
      });
      setSuccess('Usuario creado exitosamente');
      setNombre(''); setEmail(''); setPassword(''); setRole('user');
    } catch (err) {
      setError('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 glass rounded-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <select className="w-full p-3 rounded-xl bg-midnight-900 text-white" value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>{loading ? 'Creando...' : 'Crear Usuario'}</button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        {success && <div className="text-green-400 mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default CreateUser;
