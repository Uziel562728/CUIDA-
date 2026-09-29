import React from 'react';
import { useStore } from '../store/useStore';
import { Package } from 'lucide-react';

export default function ProviderCatalogo() {
  const { providers, currentUser } = useStore();
  const provider = providers.find(p => p.id === currentUser?.providerId);
  
  if (!provider) return <div className="p-8 text-center text-gray-500">Proveedor no encontrado</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {provider.products.map((prod, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-gray-900">{prod.name}</h3>
              <p className="text-sm text-gray-500">{prod.presentation}</p>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio ($)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2 font-bold"
                  value={prod.price}
                  onChange={(e) => useStore.getState().updateProviderProduct(provider.id, prod.productId, { price: Number(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                <select
                  className="w-full border rounded-lg p-2 font-bold text-sm"
                  value={prod.stock}
                  onChange={(e) => useStore.getState().updateProviderProduct(provider.id, prod.productId, { stock: e.target.value as 'available' | 'out_of_stock' })}
                >
                  <option value="available">Disponible</option>
                  <option value="out_of_stock">Agotado</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {provider.products.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No tienes productos en tu catálogo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
