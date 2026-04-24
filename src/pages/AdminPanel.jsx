import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';

const AdminPanel = () => {
  // Product State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Category State
  const [categories, setCategories] = useState([]);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, nombre: '' });

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await productsApi.get('/products?size=100');
      setProducts(data.content || []);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await productsApi.get('/categories');
      setCategories(data || []);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error('Error fetching categories:', err);
    }
  };

  // Product Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const productData = {
      nombre: currentProduct.nombre,
      descripcion: currentProduct.descripcion,
      precio: parseFloat(currentProduct.precio),
      stock: parseInt(currentProduct.stock),
      categoriaId: parseInt(currentProduct.categoriaId),
      activo: true,
    };

    try {
      const productResponse = isEditing
        ? await productsApi.put(`/products/${currentProduct.id}`, productData)
        : await productsApi.post('/products', productData);

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await productsApi.post(`/products/${productResponse.data.id}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(isEditing ? 'Producto actualizado' : 'Producto creado');
      fetchProducts();
      resetProductForm();
    } catch (err) {
      setError(isEditing ? 'Error al actualizar producto' : 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setCurrentProduct({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoriaId: product.categoria.id,
    });
    setPreview(product.imageUrl);
    setFile(null);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
      try {
        await productsApi.delete(`/products/${id}`);
        setSuccess('Producto eliminado');
        fetchProducts();
      } catch (err) {
        setError('Error al eliminar producto');
      }
    }
  };

  const resetProductForm = () => {
    setIsEditing(false);
    setCurrentProduct({ id: null, nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '' });
    setFile(null);
    setPreview(null);
  };

  // Category Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!currentCategory.nombre) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditingCategory) {
        await productsApi.put(`/categories/${currentCategory.id}`, { nombre: currentCategory.nombre });
        setSuccess('Categoría actualizada');
      } else {
        await productsApi.post('/categories', { nombre: currentCategory.nombre });
        setSuccess('Categoría creada');
      }
      fetchCategories();
      resetCategoryForm();
    } catch (err) {
      setError(isEditingCategory ? 'Error al actualizar categoría' : 'Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setIsEditingCategory(true);
    setCurrentCategory({ id: category.id, nombre: category.nombre });
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar esta categoría?')) {
      try {
        await productsApi.delete(`/categories/${id}`);
        setSuccess('Categoría eliminada');
        fetchCategories();
      } catch (err) {
        setError('Error al eliminar categoría. Asegúrate de que no tenga productos asociados.');
      }
    }
  };

  const resetCategoryForm = () => {
    setIsEditingCategory(false);
    setCurrentCategory({ id: null, nombre: '' });
  };


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-2xl">No tienes autorización para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-12 p-4 md:p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Panel de Administración</h2>
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/dashboard" className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all">Dashboard</Link>
        <Link to="/crear-usuario" className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all">Crear Usuario</Link>
      </div>

      {/* Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <input className="w-full p-3 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" placeholder="Nombre" value={currentProduct.nombre} onChange={e => setCurrentProduct({ ...currentProduct, nombre: e.target.value })} required />
              <textarea className="w-full p-3 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" placeholder="Descripción" value={currentProduct.descripcion} onChange={e => setCurrentProduct({ ...currentProduct, descripcion: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full p-3 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" placeholder="Precio" type="number" value={currentProduct.precio} onChange={e => setCurrentProduct({ ...currentProduct, precio: e.target.value })} required />
                <input className="w-full p-3 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" placeholder="Stock" type="number" value={currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value })} required />
              </div>
              <select className="w-full p-3 rounded-xl bg-slate-900/70 text-white" value={currentProduct.categoriaId} onChange={e => setCurrentProduct({ ...currentProduct, categoriaId: e.target.value })} required>
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
              <div className="w-full p-3 rounded-xl bg-slate-900/70 text-white">
                <label htmlFor="file-upload" className="cursor-pointer">{preview ? 'Cambiar imagen' : 'Seleccionar imagen'}</label>
                <input id="file-upload" className="hidden" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              {preview && <div className="mt-4"><img src={preview} alt="Vista previa" className="w-full h-auto rounded-xl object-cover" /></div>}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>{loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' : 'Crear Producto')}</button>
                {isEditing && <button type="button" onClick={resetProductForm} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all">Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-3xl h-full">
            <h3 className="text-xl font-bold text-white mb-4">Listado de Productos</h3>
            <input type="text" placeholder="Buscar producto..." className="w-full p-3 mb-4 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div className="overflow-auto max-h-150">
              <table className="w-full text-left text-white">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-2">Imagen</th><th className="p-2">Nombre</th><th className="p-2">Categoría</th><th className="p-2">Precio</th><th className="p-2">Stock</th><th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="p-2"><img src={product.imageUrl || PRODUCT_PLACEHOLDER} onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER; }} alt={product.nombre} className="w-12 h-12 rounded-md object-cover" /></td>
                      <td className="p-2">{product.nombre}</td>
                      <td className="p-2">{product.categoria?.nombre || 'N/A'}</td>
                      <td className="p-2">S/{product.precio.toFixed(2)}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2 flex gap-2"><button onClick={() => handleEditProduct(product)} className="text-indigo-400 hover:text-indigo-300">Editar</button><button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300">Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-4">{isEditingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input className="w-full p-3 rounded-xl bg-slate-900/70 text-white placeholder-gray-400" placeholder="Nombre de la categoría" value={currentCategory.nombre} onChange={e => setCurrentCategory({ ...currentCategory, nombre: e.target.value })} required />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all" disabled={loading}>{loading ? (isEditingCategory ? 'Actualizando...' : 'Creando...') : (isEditingCategory ? 'Actualizar' : 'Crear Categoría')}</button>
                {isEditingCategory && <button type="button" onClick={resetCategoryForm} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all">Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-3xl h-full">
            <h3 className="text-xl font-bold text-white mb-4">Listado de Categorías</h3>
            <div className="overflow-auto max-h-100">
              <table className="w-full text-left text-white">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-2">ID</th><th className="p-2">Nombre</th><th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="p-2">{cat.id}</td>
                      <td className="p-2">{cat.nombre}</td>
                      <td className="p-2 flex gap-2"><button onClick={() => handleEditCategory(cat)} className="text-indigo-400 hover:text-indigo-300">Editar</button><button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-300">Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Global Messages */}
      {error && <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg animate-pulse">{error}</div>}
      {success && <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">{success}</div>}
    </div>
  );
};

export default AdminPanel;
