import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Store, CheckCircle, Search, Info, Package, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { calculateEstimatedConsumption } from '../utils/stock';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Marketplace() {
  const { providers, cart, addToCart, products, orders, treatments } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedProductId = queryParams.get('product');

  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [targetDays, setTargetDays] = useState(30);
  const [manualUnits, setManualUnits] = useState<string>('');

  // Mobile Wizard Steps
  // 1 = Select Product (if not selected)
  // 2 = Calculation (Cuánto necesito)
  // 3 = Compare & Add to Cart
  const [step, setStep] = useState(selectedProductId ? 2 : 1);
  const [localSelectedProduct, setLocalSelectedProduct] = useState(selectedProductId ? products.find(p => p.id === selectedProductId) : null);

  const allProducts = providers.flatMap(p => p.products.map(prod => ({...prod, providerId: p.id, providerName: p.name})));
  
  useEffect(() => {
    if (selectedProductId) {
      const p = products.find(p => p.id === selectedProductId);
      setLocalSelectedProduct(p || null);
      if (p) setStep(2);
    }
  }, [selectedProductId, products]);

  useHardwareBack(step > 1, () => setStep(step - 1));

  // Calculations for selected product
  let dailyConsumption = 0;
  let pendingUnits = 0;
  let hasPendingOrders = false;
  let suggestedUnits = 0;
  let requiredUnits = 0;
  let isManualOverride = manualUnits !== '';

  if (localSelectedProduct) {
    dailyConsumption = calculateEstimatedConsumption(localSelectedProduct, treatments);
    
    orders.forEach(o => {
      if (o.status !== 'delivered' && o.status !== 'cancelled') {
        o.items.forEach(item => {
          if (item.productId === localSelectedProduct.id) {
            pendingUnits += item.quantity * item.unitsPerPackage;
            hasPendingOrders = true;
          }
        });
      }
    });

    if (dailyConsumption > 0) {
      suggestedUnits = targetDays * dailyConsumption;
      const calcRequired = Math.ceil(suggestedUnits - localSelectedProduct.currentQuantity - pendingUnits);
      requiredUnits = isManualOverride ? parseInt(manualUnits || '0') : Math.max(0, calcRequired);
    } else {
      requiredUnits = parseInt(manualUnits || '0');
    }
  }

  const filteredProducts = allProducts.filter(p => {
    if (localSelectedProduct && p.productId !== localSelectedProduct.id) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a,b) => (a.price / a.unitsPerPackage) - (b.price / b.unitsPerPackage)); 

  const handleAddToCart = (item: any, quantity: number) => {
    try {
      setErrorMsg('');
      addToCart({
        productId: item.productId,
        name: item.name + ' - ' + item.presentation,
        unitsPerPackage: item.unitsPerPackage,
        quantity: quantity > 0 ? quantity : 1,
        price: item.price,
        providerId: item.providerId
      });
      navigate('/carrito'); // go straight to cart after add
    } catch (error: any) {
      if (error.message === 'MULTIPLE_PROVIDERS') {
        setErrorMsg('Solo puedes comprar de un proveedor a la vez. Ve al carrito para vaciarlo si deseas cambiar.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      
      {showToast && (
        <div className="fixed top-20 right-4 md:right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="w-5 h-5 mr-2" />
          Solicitud de cotización registrada.
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reposición</h2>
          <p className="text-gray-500">
            {step === 1 ? '1. ¿Qué necesito?' : step === 2 ? '2. ¿Cuánto necesito?' : '3. Comparar y Comprar'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/carrito')}
          className="bg-gray-100 text-gray-700 p-3 rounded-full flex items-center shadow-sm relative"
        >
          <ShoppingCart className="w-5 h-5" />
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

      {/* Step 1: Select Product */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar insumo o medicación..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div 
                key={p.id} 
                onClick={() => {
                  setLocalSelectedProduct(p);
                  setStep(2);
                }}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500">Stock: {p.currentQuantity} {p.unit}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="p-8 text-center text-gray-500">No se encontraron productos en el inventario.</div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Calculation */}
      {step === 2 && localSelectedProduct && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-primary flex items-center text-sm font-medium mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Elegir otro insumo
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-xl text-gray-900 mb-1">{localSelectedProduct.name}</h3>
            <div className="flex items-start text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
              <Info className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
              <div>
                <p>Stock actual: <strong>{localSelectedProduct.currentQuantity} {localSelectedProduct.unit}</strong></p>
                {hasPendingOrders && <p className="text-warning font-medium mt-1">Pedidos pendientes: {pendingUnits} {localSelectedProduct.unit}</p>}
                {dailyConsumption > 0 && <p className="mt-1">Consumo promedio: {dailyConsumption.toFixed(2)}/día</p>}
              </div>
            </div>
            
            {dailyConsumption > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">¿Cuántos días querés cubrir?</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={targetDays} 
                    onChange={e => setTargetDays(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg font-bold text-center focus:border-primary outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ({targetDays} días × {dailyConsumption.toFixed(1)}/día) - {localSelectedProduct.currentQuantity} stock - {pendingUnits} pend = {Math.max(0, Math.ceil(suggestedUnits - localSelectedProduct.currentQuantity - pendingUnits))} uds.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad necesaria ({localSelectedProduct.unit}):</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder={Math.max(0, Math.ceil(suggestedUnits - localSelectedProduct.currentQuantity - pendingUnits)).toString()}
                    value={manualUnits}
                    onChange={e => setManualUnits(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg font-bold text-center focus:border-primary outline-none bg-blue-50/50"
                  />
                  {isManualOverride && (
                    <button onClick={() => setManualUnits('')} className="text-sm text-primary w-full text-center mt-3 font-medium">
                      Usar sugerencia automática
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ingresá la cantidad necesaria ({localSelectedProduct.unit}):</label>
                <input 
                  type="number" 
                  min="1" 
                  value={manualUnits}
                  onChange={e => setManualUnits(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg font-bold text-center focus:border-primary outline-none"
                />
              </div>
            )}
            
            <button 
              onClick={() => {
                if (requiredUnits <= 0) {
                  setErrorMsg('La cantidad a reponer debe ser mayor a 0.');
                  return;
                }
                setStep(3);
                setErrorMsg('');
              }}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg mt-6 shadow-sm flex items-center justify-center"
            >
              Comparar Ofertas <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Comparison */}
      {step === 3 && localSelectedProduct && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setStep(2)} className="text-primary flex items-center text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" /> Cambiar cantidad
            </button>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              Reponer: {requiredUnits} {localSelectedProduct.unit}
            </div>
          </div>

          <div className="space-y-4">
            {filteredProducts.map((item, idx) => {
              const isInCart = cart.some(c => c.productId === item.productId && c.providerId === item.providerId);
              const unitPrice = item.price / item.unitsPerPackage;
              const calcPackages = Math.ceil(requiredUnits / item.unitsPerPackage);

              return (
                <div key={idx} className={`bg-white rounded-2xl p-5 shadow-sm border ${item.stock === 'available' ? 'border-gray-200' : 'border-gray-100 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.providerName}</h3>
                      <p className="text-gray-500 text-sm">{item.presentation} ({item.unitsPerPackage} uds/paq)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-900">${item.price.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-500">${unitPrice.toFixed(2)}/ud</p>
                    </div>
                  </div>

                  {item.stock === 'available' ? (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 mt-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Necesitás {calcPackages} paquete(s)</p>
                        <p className="text-xs text-gray-500">Entrega: {item.delivery}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${(calcPackages * item.price).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-danger font-medium text-sm my-3">Agotado temporalmente</p>
                  )}
                  
                  <button
                    disabled={item.stock === 'out_of_stock' || isInCart}
                    onClick={() => handleAddToCart(item, calcPackages)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center ${
                      isInCart 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : item.stock === 'out_of_stock'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                    }`}
                  >
                    {isInCart ? <><CheckCircle className="w-5 h-5 mr-2" /> En carrito</> : `Agregar al Carrito`}
                  </button>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700 mb-1">No hay ofertas disponibles</h3>
                <p className="text-sm text-gray-500 mb-4">No se encontraron proveedores para este insumo.</p>
                <button 
                  onClick={() => {
                    useStore.getState().addQuoteRequest(localSelectedProduct.id, localSelectedProduct.name);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold w-full"
                >
                  Solicitar cotización
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
