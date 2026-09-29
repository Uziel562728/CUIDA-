import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { hasPermission } from '../lib/permissions';

export default function Incidentes() {
  const { incidents, addIncident, updateIncidentState, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'Caída', description: '', actions: '' });
  
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [trackForm, setTrackForm] = useState({ status: 'following' as any, note: '' });

  const canWrite = currentUser && hasPermission(currentUser.role, 'register_incident');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    addIncident({
      id: Date.now().toString(),
      date: getLocalDateString(),
      time: getLocalTimeString(),
      type: form.type,
      description: form.description,
      actions: form.actions,
      registeredBy: currentUser?.name || 'Sistema',
      status: 'reported',
      history: [{ date: getLocalDateString(), time: getLocalTimeString(), status: 'reported', user: currentUser?.name || 'Sistema' }]
    });
    setShowModal(false);
    setForm({ type: 'Caída', description: '', actions: '' });
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !canWrite) return;
    updateIncidentState(trackingId, trackForm.status, trackForm.note, currentUser?.name || 'Sistema');
    setTrackingId(null);
    setTrackForm({ status: 'following', note: '' });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registro de Incidentes</h2>
          <p className="text-gray-500">Historial y seguimiento</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} className="bg-danger text-white px-4 py-2 rounded-lg flex items-center font-bold hover:bg-red-700">
            <Plus className="w-5 h-5 mr-1" /> Nuevo
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Incidente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de incidente</label>
                <select className="w-full border rounded-lg p-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>Caída</option>
                  <option>Mareo/Desmayo</option>
                  <option>Error en medicación</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea required className="w-full border rounded-lg p-2 h-20" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Acciones tomadas</label>
                <textarea required className="w-full border rounded-lg p-2 h-20" value={form.actions} onChange={e => setForm({...form, actions: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-danger text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {incidents.length === 0 && <p className="text-gray-500 py-8 text-center bg-white rounded-xl border">No hay incidentes registrados.</p>}
        {incidents.map(inc => (
          <div key={inc.id} className="bg-white rounded-xl p-5 border border-red-100 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${inc.status === 'resolved' ? 'bg-health' : inc.status === 'attention' ? 'bg-warning' : 'bg-danger'}`}></div>
            <div className="flex justify-between mb-2 pl-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                <AlertTriangle className={`w-5 h-5 mr-2 ${inc.status === 'resolved' ? 'text-health' : inc.status === 'attention' ? 'text-warning' : 'text-danger'}`}/> 
                {inc.type}
              </h3>
              <span className="text-sm text-gray-500 font-medium">{inc.date} {inc.time}</span>
            </div>
            <div className="pl-4 space-y-2 text-sm text-gray-700">
              <p><strong>Descripción:</strong> {inc.description}</p>
              <p><strong>Acciones Iniciales:</strong> {inc.actions}</p>
              <p className="text-xs text-gray-500 mt-2">Registrado por: {inc.registeredBy}</p>
            </div>
            
            <div className="pl-4 mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-bold text-sm mb-2 text-gray-700">Seguimiento e Historial</h4>
              <ul className="space-y-2 mb-4">
                {inc.history.map((h, i) => (
                  <li key={i} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>{h.date} {h.time} ({h.status}):</strong> {h.note || 'Sin notas.'} - <em>{h.user}</em>
                  </li>
                ))}
              </ul>
              
              {canWrite && inc.status !== 'resolved' && (
                trackingId === inc.id ? (
                  <form onSubmit={handleTrack} className="bg-gray-50 p-3 rounded-lg space-y-3">
                    <select className="w-full border rounded p-2 text-sm" value={trackForm.status} onChange={e => setTrackForm({...trackForm, status: e.target.value as any})}>
                      <option value="following">En seguimiento</option>
                      <option value="attention">Requiere atención médica</option>
                      <option value="resolved">Resuelto</option>
                    </select>
                    <textarea required placeholder="Nota de seguimiento..." className="w-full border rounded p-2 text-sm h-16" value={trackForm.note} onChange={e => setTrackForm({...trackForm, note: e.target.value})}></textarea>
                    <div className="flex justify-end space-x-2">
                      <button type="button" onClick={() => setTrackingId(null)} className="px-3 py-1 text-xs font-medium text-gray-600">Cancelar</button>
                      <button type="submit" className="px-3 py-1 text-xs font-bold bg-primary text-white rounded">Actualizar</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setTrackingId(inc.id)} className="text-sm text-primary font-bold hover:underline">
                    + Añadir actualización de estado
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
