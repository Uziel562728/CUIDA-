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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Control de Stock</h2>
          <p className="text-gray-500 dark:text-gray-400">Insumos y medicamentos</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Ajustar Stock Real</h3>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nueva Cantidad Total</label>
                <input required type="number" min="0" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2" value={adjustVal} onChange={e => setAdjustVal(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Motivo del Ajuste</label>
                <input required type="text" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2" placeholder="Ej: Pérdida, uso no registrado..." value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAdjust(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {products.map((product) => {
            const dailyCon = calculateEstimatedConsumption(product, useStore.getState().treatments);
            const estDays = dailyCon > 0 ? (product.currentQuantity / dailyCon) : null;
            const isCriticalStock = (estDays !== null && estDays <= 2) || (product.minStock && product.currentQuantity <= product.minStock / 2);
            const isLowStock = !isCriticalStock && ((estDays !== null && estDays <= 5) || (product.minStock && product.currentQuantity <= product.minStock));

            return (
              <div key={product.id} className="p-4 flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
                  </div>
                  {isCriticalStock ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Crítico
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Óptimo
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-xs">Cantidad Actual</span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">{product.currentQuantity} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{product.unit}</span></span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-xs">Estimado Restante</span>
                    <span className={\`font-semibold \${isCriticalStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-health'}\`}>
                      {estDays !== null ? \`~\${estDays.toFixed(1)} días\` : 'N/A'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end space-x-4 pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-1">
                    <button 
                      onClick={() => navigate(\`/marketplace?product=\${product.id}\`)}
                      className="text-primary font-medium text-sm flex items-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Reponer
                    </button>
                    <button onClick={() => { setShowAdjust(product.id); setAdjustVal(product.currentQuantity.toString()); }} className="text-gray-400 hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Cantidad Actual</th>
                <th className="p-4 font-medium">Consumo Promedio</th>
                <th className="p-4 font-medium">Estimado Restante</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((product) => {
                const dailyCon = calculateEstimatedConsumption(product, useStore.getState().treatments);
                const estDays = dailyCon > 0 ? (product.currentQuantity / dailyCon) : null;
                const isCriticalStock = (estDays !== null && estDays <= 2) || (product.minStock && product.currentQuantity <= product.minStock / 2);
                const isLowStock = !isCriticalStock && ((estDays !== null && estDays <= 5) || (product.minStock && product.currentQuantity <= product.minStock));

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white text-lg">
                      {product.currentQuantity} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{product.unit}</span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {dailyCon > 0 ? \`\${dailyCon.toFixed(1)} / día\` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={\`font-semibold \${isCriticalStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-health'}\`}>
                        {estDays !== null ? \`~\${estDays.toFixed(1)} días\` : 'Sin estimación'}
                      </span>
                    </td>
                    <td className="p-4">
                      {isCriticalStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Crítico
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isAdmin && (
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => navigate(\`/marketplace?product=\${product.id}\`)}
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
