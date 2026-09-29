import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, ShoppingCart, Plus, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '../lib/permissions';
import { calculateEstimatedConsumption } from '../utils/stock';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Stock() {
  const { products, updateProductStock, currentUser } = useStore();
  const navigate = useNavigate();
  const [showAdjust, setShowAdjust] = useState<string | null>(null);
  const [adjustVal, setAdjustVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useHardwareBack(!!showAdjust, () => setShowAdjust(null));

  const isAdmin = currentUser && hasPermission(currentUser.role, 'manage_stock');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAdjust && adjustVal && adjustReason && isAdmin) {
      updateProductStock(showAdjust, parseInt(adjustVal, 10), adjustReason, currentUser.name);
      setShowAdjust(null);
      setAdjustVal('');
      setAdjustReason('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Stock</h2>
          <p className="text-gray-500">Insumos y medicamentos</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/marketplace')}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-light transition-colors flex items-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span>Reponer Stock</span>
          </button>
        )}
      </header>

      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Ajustar Stock Real</h3>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nueva Cantidad Total</label>
                <input required type="number" min="0" className="w-full border rounded-lg p-2" value={adjustVal} onChange={e => setAdjustVal(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo del Ajuste</label>
                <input required type="text" className="w-full border rounded-lg p-2" placeholder="Ej: Pérdida, uso no registrado..." value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdjust(null)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Cantidad Actual</th>
                <th className="p-4 font-medium hidden md:table-cell">Consumo Promedio</th>
                <th className="p-4 font-medium">Estimado Restante</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const dailyCon = calculateEstimatedConsumption(product, useStore.getState().treatments);
                const estDays = dailyCon > 0 ? (product.currentQuantity / dailyCon) : null;
                const isCriticalStock = (estDays !== null && estDays <= 2) || (product.minStock && product.currentQuantity <= product.minStock / 2);
                const isLowStock = !isCriticalStock && ((estDays !== null && estDays <= 5) || (product.minStock && product.currentQuantity <= product.minStock));

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-lg">
                      {product.currentQuantity} <span className="text-sm font-normal text-gray-500">{product.unit}</span>
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">
                      {dailyCon > 0 ? `${dailyCon.toFixed(1)} / día` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${isCriticalStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-health'}`}>
                        {estDays !== null ? `~${estDays.toFixed(1)} días` : 'Sin estimación'}
                      </span>
                    </td>
                    <td className="p-4">
                      {isCriticalStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Crítico
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isAdmin && (
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => navigate(`/marketplace?product=${product.id}`)}
                            className="text-primary hover:text-primary-dark font-medium text-sm flex items-center"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Reponer
                          </button>
                          <button onClick={() => { setShowAdjust(product.id); setAdjustVal(product.currentQuantity.toString()); }} className="text-gray-400 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
