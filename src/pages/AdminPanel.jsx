import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [file, setFile] = useState(null);
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
      // Crear producto
      const { data: product } = await productsApi.post('/products', {
        nombre,
        descripcion,
        precio,
        stock,
        categoriaId,
        activo: true,
      });
      // Subir imagen si hay archivo
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await productsApi.post(`/products/${product.id}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setSuccess('Producto creado exitosamente');
      setNombre(''); setDescripcion(''); setPrecio(''); setStock(''); setCategoriaId(''); setFile(null);
    } catch (err) {
      setError('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 glass rounded-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Panel de Administración</h2>
      <div className="flex gap-4 mb-6">
        <Link to="/dashboard" className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all">Dashboard</Link>
        <Link to="/crear-usuario" className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all">Crear Usuario</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <textarea className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Precio" type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" placeholder="ID Categoría" value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required />
        <input className="w-full p-3 rounded-xl bg-midnight-900 text-white" type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>{loading ? 'Creando...' : 'Crear Producto'}</button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        {success && <div className="text-green-400 mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default AdminPanel;
