import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ProviderCatalogo() {
  const { providers, currentUser } = useStore();
  const provider = providers.find(p => p.id === currentUser?.providerId);
  
  if (!provider) return <div className="p-8 text-center text-gray-500">Proveedor no encontrado</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
      </header>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500 text-sm">
            <tr>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium hidden sm:table-cell">Presentación</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {provider.products.map((prod, i) => (
              <tr key={i}>
                <td className="p-4 font-medium">{prod.name}</td>
                <td className="p-4 text-sm text-gray-500 hidden sm:table-cell">{prod.presentation}</td>
                <td className="p-4 font-bold">
                  <input
                    type="number"
                    className="w-24 border rounded p-1"
                    value={prod.price}
                    onChange={(e) => useStore.getState().updateProviderProduct(provider.id, prod.productId, { price: Number(e.target.value) })}
                  />
                </td>
                <td className="p-4">
                  <select
                    className="border rounded p-1 text-xs font-bold"
                    value={prod.stock}
                    onChange={(e) => useStore.getState().updateProviderProduct(provider.id, prod.productId, { stock: e.target.value })}
                  >
                    <option value="available">Disponible</option>
                    <option value="out_of_stock">Agotado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
