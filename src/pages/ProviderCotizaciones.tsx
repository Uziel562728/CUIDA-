import React, { useState } from 'react';
import { useStore } from '../store/useStore';

import { useHardwareBack } from '../hooks/useHardwareBack';

export default function ProviderCotizaciones() {
  const { providers, currentUser, quoteRequests, respondQuoteRequest } = useStore();
  const provider = providers.find(p => p.id === currentUser?.providerId);
  
  const [replyForms, setReplyForms] = useState<Record<string, {price: number, presentation: string, units: number}>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useHardwareBack(!!errorMsg, () => setErrorMsg(''));

  if (!provider) return <div className="p-8 text-center text-gray-500">Proveedor no encontrado</div>;

  const pendingRequests = quoteRequests.filter(q => q.status === 'pending' || (q.status === 'answered' && !q.responses.some(r => r.providerId === provider.id)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {errorMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-danger mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold w-full">Cerrar</button>
          </div>
        </div>
      )}

      <header>
        <h2 className="text-2xl font-bold text-gray-900">Cotizaciones (Demo)</h2>
        <p className="text-gray-500">Responde a las solicitudes de los clientes</p>
      </header>

      {pendingRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center text-gray-500">
          No tienes solicitudes pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(req => (
            <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="font-bold text-lg text-blue-900">{req.productName}</p>
              <p className="text-sm text-gray-500 mb-4">Solicitado el: {req.date}</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Precio Paquete ($)</label>
                  <input 
                    type="number" 
                    className="border rounded-lg p-2 text-sm w-full sm:w-32"
                    value={replyForms[req.id]?.price || ''}
                    onChange={e => setReplyForms({...replyForms, [req.id]: {...replyForms[req.id], price: Number(e.target.value)}})}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Presentación</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Caja x30"
                    className="border rounded-lg p-2 text-sm w-full sm:w-40"
                    value={replyForms[req.id]?.presentation || ''}
                    onChange={e => setReplyForms({...replyForms, [req.id]: {...replyForms[req.id], presentation: e.target.value}})}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unidades</label>
                  <input 
                    type="number" 
                    className="border rounded-lg p-2 text-sm w-full sm:w-32"
                    value={replyForms[req.id]?.units || ''}
                    onChange={e => setReplyForms({...replyForms, [req.id]: {...replyForms[req.id], units: Number(e.target.value)}})}
                  />
                </div>
                <button 
                  onClick={() => {
                    const form = replyForms[req.id];
                    if (form && form.price && form.presentation && form.units) {
                      respondQuoteRequest(req.id, provider.id, provider.name, form.price, form.presentation, form.units);
                    } else {
                      setErrorMsg('Por favor completa todos los campos.');
                    }
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold w-full sm:w-auto hover:bg-primary-dark"
                >
                  Enviar Oferta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
