import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { Pill, Plus, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { hasPermission } from '../lib/permissions';

export default function Medications() {
  const { treatments, doses, generateDosesForDay, logDose, products, currentUser } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const todayStr = getLocalDateString();

  useEffect(() => {
    generateDosesForDay(todayStr);
  }, [generateDosesForDay, todayStr]);

  const todaysDoses = doses.filter(d => d.date === todayStr).sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const handleLogDose = (doseId: string, status: 'taken'|'missed') => {

    let obs: string | undefined = undefined;
    if (status === 'missed') {
      const promptResult = window.prompt('Motivo de la omisión:');
      if (promptResult === null || promptResult.trim() === '') {
        alert('Se requiere un motivo para omitir la dosis.');
        return;
      }
      obs = promptResult.trim();
    }
    
    try {
      logDose(doseId, status, currentUser?.name || 'Sistema', obs);
    } catch(error: any) {
      alert(error.message);
    }
  };

  const [form, setForm] = useState({ medicationName: '', presentation: '', quantityPerDose: 1, unit: 'comprimido', frequency: 'Cada 24 horas', schedules: '08:00', startDate: getLocalDateString(), indications: '', productId: '' });

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicationName || !form.presentation || form.quantityPerDose <= 0 || !form.productId) {
      alert("Por favor completa los campos obligatorios y asegúrate de que la cantidad sea positiva.");
      return;
    }
    const parsedSchedules = Array.from(new Set(form.schedules.split(',').map(s => s.trim()))).filter(s => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(s));
    
    if (parsedSchedules.length === 0) {
      alert("Debes ingresar al menos un horario válido en formato HH:mm (ej. 08:00).");
      return;
    }

    const newTreat = {
      id: Date.now().toString(),
      patientId: 'p1',
      productId: form.productId,
      medicationName: form.medicationName,
      presentation: form.presentation,
      quantityPerDose: Number(form.quantityPerDose),
      unit: form.unit,
      frequency: form.frequency,
      schedules: parsedSchedules,
      repeatDays: [0,1,2,3,4,5,6], // daily for demo
      startDate: form.startDate,
      indications: form.indications,
      professional: currentUser?.name || 'Médico',
      status: 'active' as const
    };
    useStore.getState().addTreatment(newTreat);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicación</h2>
          <p className="text-gray-500">Agenda de dosis y tratamientos</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-light transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Tratamiento</span>
          </button>
        )}
      </header>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Agregar Tratamiento</h3>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Insumo vinculado (Stock)</label>
                  <select required className="w-full border rounded-lg p-2" value={form.productId} onChange={e => setForm({...form, productId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {products.filter(p => p.category === 'medication' || p.category === 'other').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                  <input required className="w-full border rounded-lg p-2" value={form.medicationName} onChange={e => setForm({...form, medicationName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Presentación</label>
                  <input required className="w-full border rounded-lg p-2" placeholder="Ej: 50mg" value={form.presentation} onChange={e => setForm({...form, presentation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad por toma</label>
                  <input required type="number" min="0.1" step="0.1" className="w-full border rounded-lg p-2" value={form.quantityPerDose} onChange={e => setForm({...form, quantityPerDose: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad</label>
                  <input required className="w-full border rounded-lg p-2" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horarios (coma sep)</label>
                  <input required className="w-full border rounded-lg p-2" placeholder="08:00, 20:00" value={form.schedules} onChange={e => setForm({...form, schedules: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Indicaciones</label>
                <textarea className="w-full border rounded-lg p-2" value={form.indications} onChange={e => setForm({...form, indications: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-4">Agenda de Hoy ({todayStr})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {todaysDoses.map((d) => {
            const treat = treatments.find(t => t.id === d.treatmentId);
            if (!treat) return null;
            
            return (
              <div key={d.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center text-primary font-bold text-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    {d.scheduledTime}
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    d.status === 'taken' ? 'bg-health/10 text-health' : 
                    d.status === 'missed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                  }`}>
                    {d.status === 'taken' ? 'Tomada' : d.status === 'missed' ? 'Omitida' : 'Pendiente'}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-900">{treat.medicationName}</h4>
                <p className="text-sm text-gray-500 mb-4">{treat.presentation} - Tomar {treat.quantityPerDose} {treat.unit}</p>

                {d.status === 'pending' ? (
                  currentUser && hasPermission(currentUser.role, 'administer_medication') ? (
                    <div className="flex space-x-2">
                      <button onClick={() => handleLogDose(d.id, 'taken')} className="flex-1 bg-health/10 text-health hover:bg-health hover:text-white py-2 rounded-lg text-sm font-bold transition-colors">
                        Confirmar Toma
                      </button>
                      <button onClick={() => handleLogDose(d.id, 'missed')} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors">
                        Omitir
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 pt-2 border-t border-gray-50 italic">
                      Pendiente de confirmación.
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-50">
                    <span className="block font-medium">Registrado a las {d.actualTime}</span>
                    <span className="block">Por: {d.registeredBy}</span>
                    {d.observations && <span className="block italic mt-1 text-xs">Nota: {d.observations}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <h3 className="text-lg font-bold mb-4">Tratamientos Activos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {treatments.filter(t => t.status === 'active').map(treat => (
            <div key={treat.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-health"></div>
              <h4 className="font-bold text-gray-900 flex items-center mb-1">
                <Pill className="w-5 h-5 mr-2 text-primary" />
                {treat.medicationName} {treat.presentation}
              </h4>
              <div className="space-y-1 text-sm text-gray-600 ml-7">
                <p><strong>Dosis:</strong> {treat.quantityPerDose} {treat.unit} ({treat.frequency})</p>
                <p><strong>Horarios:</strong> {treat.schedules.join(', ')}</p>
                <p><strong>Inicio:</strong> {treat.startDate}</p>
                <p className="text-xs italic mt-2">{treat.indications}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
