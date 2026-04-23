import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { productsApi } from '../services/api';
import Navbar from '../components/Navbar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.get('/products');
        setProducts(response.data.content || []);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <header className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Nuestro Hardware</h2>
          <p className="text-slate-400">Componentes de alto rendimiento seleccionados para ti.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass h-80 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass group rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col"
              >
                <div className="relative h-48 bg-midnight-900 overflow-hidden">
                  <img 
                    src={product.imageUrl || `https://ecommerce-athena-results-12345.s3.amazonaws.com/images/products/${product.id}.jpg`}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-midnight-950/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-white">4.8</span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    {product.categoria || 'Hardware'}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.nombre}</h3>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                    {product.descripcion || 'Especificaciones de alto nivel para setups profesionales.'}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Precio</span>
                      <span className="text-xl font-bold text-white">S/{product.precio}</span>
                    </div>
                    <button className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-90">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
