import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Store, CheckCircle, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const { providers, cart, addToCart } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allProducts = providers.flatMap(p => p.products.map(prod => ({...prod, providerId: p.id, providerName: p.name})));
  
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = providerFilter === '' || p.providerId === providerFilter;
    const matchesStock = !stockFilter || p.stock === 'available';
    return matchesSearch && matchesProvider && matchesStock;
  }).sort((a,b) => a.price - b.price);

  const handleAddToCart = (item: any) => {
    try {
      setErrorMsg('');
      addToCart({
        productId: item.productId,
        name: item.name + ' - ' + item.presentation,
        unitsPerPackage: item.unitsPerPackage,
        quantity: 1,
        price: item.price,
        providerId: item.providerId
      });
    } catch (error: any) {
      if (error.message === 'MULTIPLE_PROVIDERS') {
        setErrorMsg('Solo puedes comprar de un proveedor a la vez. Ve al carrito para vaciarlo si deseas cambiar.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo / Marketplace</h2>
          <p className="text-gray-500">Reponer insumos y medicación</p>
        </div>
        <button 
          onClick={() => navigate('/carrito')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-light transition-colors flex items-center relative"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span>Carrito</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-danger text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o proveedor..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-4 w-full sm:w-auto">
          <select 
            className="border rounded-lg p-2 bg-white flex-1"
            value={providerFilter}
            onChange={e => setProviderFilter(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input type="checkbox" checked={stockFilter} onChange={e => setStockFilter(e.target.checked)} className="rounded" />
            <span>Solo en stock</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((item, idx) => {
          const isInCart = cart.some(c => c.productId === item.productId && c.providerId === item.providerId);
          
          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{item.presentation}</p>
                
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center text-primary font-medium">
                    <Store className="w-4 h-4 mr-2" />
                    {item.providerName}
                  </div>
                  <div className="flex justify-between border-t border-gray-50 pt-2">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-bold text-gray-900 text-lg">${item.price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disponibilidad:</span>
                    <span className={item.stock === 'available' ? 'text-health font-medium' : 'text-danger font-medium'}>
                      {item.stock === 'available' ? 'En stock' : 'Agotado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entrega:</span>
                    <span className="text-gray-900">{item.delivery}</span>
                  </div>
                </div>
              </div>
              
              <button
                disabled={item.stock === 'out_of_stock' || isInCart}
                onClick={() => handleAddToCart(item)}
                className={`w-full py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center ${
                  isInCart 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : item.stock === 'out_of_stock'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isInCart ? <><CheckCircle className="w-5 h-5 mr-2" /> En carrito</> : 'Agregar al carrito'}
              </button>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron productos con ese término de búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
