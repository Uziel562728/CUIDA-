import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, placeOrder, providers, patient } = useStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta_demo');
  const [paymentRejected, setPaymentRejected] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = totalItems > 0 ? 2000 : 0;
  const finalTotal = totalItems + shipping;

  const provider = cart.length > 0 ? providers.find(p => p.id === cart[0].providerId) : null;

  const handleCheckout = () => {
    setIsProcessing(true);
    setPaymentRejected(false);
    setTimeout(() => {
      if (paymentMethod === 'tarjeta_rechazada') {
        setPaymentRejected(true);
        setIsProcessing(false);
      } else {
        placeOrder(paymentMethod, patient.address);
        setIsProcessing(false);
        setIsSuccess(true);
      }
    }, 2000);
  };

  const handleClear = () => {
    if (confirm('¿Seguro que deseas vaciar el carrito?')) {
      clearCart();
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-health/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-health" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">PAGO DE DEMOSTRACIÓN APROBADO</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Tu pedido simulado ha sido procesado correctamente y ya fue enviado al proveedor.</p>
        <button 
          onClick={() => navigate('/pedidos')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-light transition-colors"
        >
          Ver mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-900">
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Carrito de Compras
          </h2>
        </div>
        {cart.length > 0 && (
          <button onClick={handleClear} className="text-danger font-medium text-sm hover:underline">
            Vaciar Carrito
          </button>
        )}
      </header>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500 mb-6">Agrega insumos o medicación desde el Marketplace para continuar.</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-light transition-colors"
          >
            Ir al Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-primary/10 text-primary p-4 rounded-xl flex items-start border border-primary/20">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Proveedor: {provider?.name}</p>
                <p>Todos los productos en este carrito provienen del mismo proveedor para optimizar el envío.</p>
              </div>
            </div>

            {cart.map(item => (
              <div key={item.productId} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.unitsPerPackage} unidades/paquete</p>
                  <p className="text-primary font-bold mt-1">${item.price.toLocaleString('es-AR')}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button 
                      className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-l-lg"
                      onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    >-</button>
                    <span className="px-3 py-1 font-bold">{item.quantity}</span>
                    <button 
                      className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-r-lg"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >+</button>
                  </div>
                  <div className="text-right w-24">
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de compra</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalItems.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío ({provider?.name})</span>
                <span>${shipping.toLocaleString('es-AR')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">TOTAL</span>
              <span className="text-2xl font-bold text-primary">${finalTotal.toLocaleString('es-AR')}</span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-700 mb-1">Dirección de Envío</h4>
              <p className="text-sm text-gray-500">{patient.address}</p>
            </div>

            <div className="mb-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago (Simulado)</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary">
                <option value="tarjeta_demo">Tarjeta de Crédito (Aprobada)</option>
                <option value="tarjeta_rechazada">Tarjeta de Crédito (Rechazada)</option>
                <option value="mercadopago_demo">Mercado Pago (Demo)</option>
              </select>
            </div>

            {paymentRejected && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <p>Pago rechazado. Por favor, intente con otro método.</p>
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full text-white py-3 rounded-xl font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70 ${paymentRejected ? 'bg-warning hover:bg-yellow-600' : 'bg-health hover:bg-health-light'}`}
            >
              {isProcessing ? 'Procesando...' : (
                <>{paymentRejected ? 'Reintentar Pago' : 'Confirmar Pago'} <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">
              * Operación 100% simulada. No requiere datos reales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
