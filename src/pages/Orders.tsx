import React from 'react';
import { useStore } from '../store/useStore';
import { ShoppingBag, Truck, CheckCircle, Package } from 'lucide-react';

export default function Orders() {
  const { orders } = useStore();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid': return { label: 'Pago Aprobado', color: 'bg-info/10 text-info', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'preparing': return { label: 'Preparando', color: 'bg-warning/10 text-warning', icon: <Package className="w-4 h-4 mr-1" /> };
      case 'shipping': return { label: 'En Camino', color: 'bg-primary/10 text-primary', icon: <Truck className="w-4 h-4 mr-1" /> };
      case 'delivered': return { label: 'Entregado', color: 'bg-health/10 text-health', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      default: return { label: 'Pendiente', color: 'bg-gray-100 text-gray-600', icon: <Package className="w-4 h-4 mr-1" /> };
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
        <p className="text-gray-500">Seguimiento de compras y reposiciones</p>
      </header>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes pedidos en curso.</p>
          </div>
        ) : (
          orders.map(order => {
            const statusInfo = getStatusDisplay(order.status);
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900">Pedido #{order.id}</h3>
                    <p className="text-sm text-gray-500">{order.date} • {order.providerName}</p>
                  </div>
                  <div className={`mt-2 md:mt-0 flex items-center px-3 py-1.5 rounded-full text-sm font-medium w-fit ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-gray-900">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="font-medium text-gray-500">Total</span>
                  <span className="text-xl font-bold text-primary">${order.total.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-gray-50 hidden md:block">
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all" style={{ width: order.status === 'delivered' ? '100%' : order.status === 'shipping' ? '75%' : order.status === 'preparing' ? '50%' : '25%' }}></div>
                    
                    <div className="relative flex justify-between">
                      {['Pago Aprobado', 'Preparando', 'En Camino', 'Entregado'].map((step, idx) => {
                        const stepLevel = idx === 0 ? 'paid' : idx === 1 ? 'preparing' : idx === 2 ? 'shipping' : 'delivered';
                        const isActive = 
                          (order.status === 'delivered') || 
                          (order.status === 'shipping' && idx <= 2) ||
                          (order.status === 'preparing' && idx <= 1) ||
                          (order.status === 'paid' && idx === 0);
                        
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-4 z-10 ${isActive ? 'bg-primary border-white ring-2 ring-primary' : 'bg-gray-300 border-white'}`}></div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
