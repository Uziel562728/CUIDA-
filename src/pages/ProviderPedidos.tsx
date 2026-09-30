import React from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, formatTime12h, formatDateDDMMYYYY } from '../utils/date';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function ProviderPedidos() {
  const { orders, updateOrderStatus, currentUser } = useStore();
  const providerOrders = orders.filter(o => o.providerId === currentUser?.providerId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
      </header>

      {providerOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Total Pedidos</p>
            <p className="text-2xl font-bold">{providerOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Pedidos Pendientes</p>
            <p className="text-2xl font-bold">{providerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold text-health">${providerOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString('es-AR')}</p>
          </div>
        </div>
      )}

      {providerOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500">No hay pedidos recibidos aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providerOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b">
                <div>
                  <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                  <p className="text-sm text-gray-500">{formatDateDDMMYYYY(order.date)} {formatTime12h(order.time)} - Destino: {(order as any).patientName || 'Paciente'} ({(order as any).deliveryAddress || 'Dirección no especificada'})</p>
                </div>
                <div className="mt-2 md:mt-0 px-3 py-1 bg-gray-100 rounded-full font-bold text-sm">
                  TOTAL: ${order.total.toLocaleString('es-AR')}
                </div>
              </div>

              <div className="mb-6 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name} ({item.unitsPerPackage} unid. c/u)</span>
                    <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  <span className="text-sm text-gray-500 block mb-1">Estado actual:</span>
                  <span className="font-bold text-primary capitalize">{order.status === 'paid' ? 'Pago Aprobado (Nuevo)' : order.status === 'preparing' ? 'Preparando' : order.status === 'shipping' ? 'En Camino' : order.status === 'delivered' ? 'Entregado' : order.status}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    disabled={order.status !== 'paid'} 
                    onClick={() => updateOrderStatus(order.id, 'preparing', currentUser?.name || '')}
                    className="px-4 py-2 bg-warning text-white rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    <Package className="w-4 h-4 inline mr-1"/> Preparar
                  </button>
                  <button 
                    disabled={order.status !== 'preparing'} 
                    onClick={() => updateOrderStatus(order.id, 'shipping', currentUser?.name || '')}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4 inline mr-1"/> Enviar
                  </button>
                  <button 
                    disabled={order.status !== 'shipping'} 
                    onClick={() => updateOrderStatus(order.id, 'delivered', currentUser?.name || '')}
                    className="px-4 py-2 bg-health text-white rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1"/> Entregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
