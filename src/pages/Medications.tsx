import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { Pill, Plus, Clock } from 'lucide-react';
import { hasPermission } from '../lib/permissions';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Medications() {
  const { treatments, doses, generateDosesForDay, logDose, products, currentUser } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom Modals states
  const [errorMsg, setErrorMsg] = useState('');
  const [omitModal, setOmitModal] = useState<{show: boolean, doseId: string, reason: string}>({show: false, doseId: '', reason: ''});

  useHardwareBack(showAddModal, () => setShowAddModal(false));
  useHardwareBack(omitModal.show, () => setOmitModal({show: false, doseId: '', reason: ''}));
  useHardwareBack(!!errorMsg, () => setErrorMsg(''));

  const todayStr = getLocalDateString();

  useEffect(() => {
    generateDosesForDay(todayStr);
  }, [generateDosesForDay, todayStr]);

  const todaysDoses = doses.filter(d => d.date === todayStr).sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const handleLogDose = (doseId: string, status: 'taken'|'missed') => {
    if (status === 'missed') {
      setOmitModal({ show: true, doseId, reason: '' });
      return;
    }
    try {
      logDose(doseId, status, currentUser?.name || 'Sistema');
    } catch(error: any) {
      setErrorMsg(error.message);
    }
  };

  const confirmOmit = () => {
    if (omitModal.reason.trim() === '') {
      setErrorMsg('Se requiere un motivo para omitir la dosis.');
      return;
    }
    try {
      logDose(omitModal.doseId, 'missed', currentUser?.name || 'Sistema', omitModal.reason.trim());
      setOmitModal({show: false, doseId: '', reason: ''});
    } catch(error: any) {
      setErrorMsg(error.message);
    }
  };

  const [form, setForm] = useState({ medicationName: '', presentation: '', quantityPerDose: 1, unit: 'comprimido', frequency: 'Cada 24 horas', schedules: '08:00', startDate: getLocalDateString(), indications: '', productId: '' });

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicationName || !form.presentation || form.quantityPerDose <= 0 || !form.productId) {
      setErrorMsg("Por favor completa los campos obligatorios y asegúrate de que la cantidad sea positiva.");
      return;
    }
    const parsedSchedules = Array.from(new Set(form.schedules.split(',').map(s => s.trim()))).filter(s => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(s));
    
    if (parsedSchedules.length === 0) {
      setErrorMsg("Debes ingresar al menos un horario válido en formato HH:mm (ej. 08:00).");
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
    <div className="space-y-6 pb-20">
      
      {/* Error Modal */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-danger mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold w-full">Cerrar</button>
          </div>
        </div>
      )}

      {/* Omit Modal */}
      {omitModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Omitir Dosis</h3>
            <p className="text-sm text-gray-600 mb-4">Por favor, indique el motivo por el cual no se administró esta dosis.</p>
            <textarea 
              autoFocus
              className="w-full border rounded-lg p-3 mb-4 min-h-[100px]"
              placeholder="Ej: El paciente rechazó la medicación..."
              value={omitModal.reason}
              onChange={e => setOmitModal({...omitModal, reason: e.target.value})}
            />
            <div className="flex space-x-3">
              <button onClick={() => setOmitModal({show: false, doseId: '', reason: ''})} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-bold">Cancelar</button>
              <button onClick={confirmOmit} className="flex-1 bg-danger text-white hover:bg-red-600 px-4 py-3 rounded-lg font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicación</h2>
          <p className="text-gray-500">Agenda de dosis y tratamientos</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white p-3 rounded-full md:rounded-lg font-medium hover:bg-primary-light transition-colors flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 md:mr-1" />
            <span className="hidden md:inline">Tratamiento</span>
          </button>
        )}
      </header>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Agregar Tratamiento</h3>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Insumo (Stock)</label>
                  <select required className="w-full border rounded-lg p-3 bg-gray-50" value={form.productId} onChange={e => setForm({...form, productId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {products.filter(p => p.category === 'medication' || p.category === 'other').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                  <input required className="w-full border rounded-lg p-3 bg-gray-50" value={form.medicationName} onChange={e => setForm({...form, medicationName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Presentación</label>
                  <input required className="w-full border rounded-lg p-3 bg-gray-50" placeholder="Ej: 50mg" value={form.presentation} onChange={e => setForm({...form, presentation: e.target.value})} />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Cant.</label>
                    <input required type="number" min="0.1" step="0.1" className="w-full border rounded-lg p-3 bg-gray-50" value={form.quantityPerDose} onChange={e => setForm({...form, quantityPerDose: Number(e.target.value)})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Unidad</label>
                    <input required className="w-full border rounded-lg p-3 bg-gray-50" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Horarios (coma sep)</label>
                  <input required className="w-full border rounded-lg p-3 bg-gray-50" placeholder="08:00, 20:00" value={form.schedules} onChange={e => setForm({...form, schedules: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Indicaciones</label>
                  <textarea className="w-full border rounded-lg p-3 bg-gray-50" value={form.indications} onChange={e => setForm({...form, indications: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold w-full md:w-auto">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-bold w-full md:w-auto">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-700">Agenda de Hoy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {todaysDoses.map((d) => {
            const treat = treatments.find(t => t.id === d.treatmentId);
            if (!treat) return null;
            
            return (
              <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center text-primary font-black text-2xl">
                      <Clock className="w-6 h-6 mr-2 opacity-50" />
                      {d.scheduledTime}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      d.status === 'taken' ? 'bg-health/10 text-health' : 
                      d.status === 'missed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                    }`}>
                      {d.status === 'taken' ? 'Tomada' : d.status === 'missed' ? 'Omitida' : 'Pendiente'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{treat.medicationName}</h4>
                  <p className="text-gray-500 mb-4">{treat.presentation} - {treat.quantityPerDose} {treat.unit}</p>
                </div>

                {d.status === 'pending' ? (
                  currentUser && hasPermission(currentUser.role, 'administer_medication') ? (
                    <div className="flex space-x-3 mt-2">
                      <button onClick={() => handleLogDose(d.id, 'taken')} className="flex-1 bg-health/10 text-health hover:bg-health hover:text-white py-3 rounded-xl text-sm font-bold transition-colors">
                        Confirmar
                      </button>
                      <button onClick={() => handleLogDose(d.id, 'missed')} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 rounded-xl text-sm font-bold transition-colors">
                        Omitir
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 pt-3 border-t border-gray-50 italic">
                      Pendiente de confirmación.
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-500 pt-3 border-t border-gray-50 bg-gray-50/50 p-2 rounded-lg">
                    <span className="block font-medium">Registrado a las {d.actualTime}</span>
                    <span className="block text-xs">Por: {d.registeredBy}</span>
                    {d.observations && <span className="block italic mt-2 text-xs text-danger">Motivo: {d.observations}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <h3 className="text-lg font-bold mb-4 text-gray-700">Tratamientos Activos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {treatments.filter(t => t.status === 'active').map(treat => (
            <div key={treat.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/40"></div>
              <h4 className="font-bold text-gray-900 flex items-center mb-2 pl-4 text-lg">
                {treat.medicationName}
              </h4>
              <div className="space-y-2 text-sm text-gray-600 pl-4">
                <p><strong>Presentación:</strong> {treat.presentation}</p>
                <p><strong>Dosis:</strong> {treat.quantityPerDose} {treat.unit} ({treat.frequency})</p>
                <p><strong>Horarios:</strong> {treat.schedules.join(', ')}</p>
                {treat.indications && <p className="text-xs italic mt-2 bg-gray-50 p-2 rounded-lg">{treat.indications}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
