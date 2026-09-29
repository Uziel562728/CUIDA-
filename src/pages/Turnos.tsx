import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Turnos() {
  const { shifts, startShift, endShift, currentUser } = useStore();
  
  const [showEndModal, setShowEndModal] = useState(false);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  useHardwareBack(showEndModal, () => setShowEndModal(false));
  
  const [report, setReport] = useState('');
  const [details, setDetails] = useState({
    alimentacion: 'Normal',
    higiene: 'Realizada',
    movilidad: 'Asistida',
    sueno: 'Sin alteraciones',
    insumos: 'Ninguno especial'
  });

  const handleStart = () => {
    if (!currentUser) return;
    startShift({
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      date: getLocalDateString(),
      startTime: getLocalTimeString(),
      status: 'active'
    });
  };

  const handleEnd = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeShiftId) {
      endShift(activeShiftId, report, details);
      setShowEndModal(false);
      setReport('');
    }
  };

  const activeShift = shifts.find(s => s.status === 'active' && s.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Turnos de Enfermería</h2>
        <p className="text-gray-500">Gestión de jornada laboral</p>
      </header>

      {(currentUser?.role === 'nurse' || currentUser?.role === 'admin') && (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          {activeShift ? (
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Turno en curso</h3>
              <p className="text-gray-500 mb-6">Iniciado hoy a las {activeShift.startTime}</p>
              <button 
                onClick={() => { setActiveShiftId(activeShift.id); setShowEndModal(true); }}
                className="bg-danger text-white px-8 py-3 rounded-lg font-bold w-full md:w-auto"
              >
                FINALIZAR TURNO
              </button>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-6">No hay turno activo</h3>
              <button 
                onClick={handleStart}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold w-full md:w-auto"
              >
                INICIAR TURNO
              </button>
            </div>
          )}
        </div>
      )}

      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Finalizar Turno</h3>
            <form onSubmit={handleEnd} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Alimentación</label>
                  <input required className="w-full border rounded p-2" value={details.alimentacion} onChange={e => setDetails({...details, alimentacion: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Higiene</label>
                  <input required className="w-full border rounded p-2" value={details.higiene} onChange={e => setDetails({...details, higiene: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Movilidad</label>
                  <input required className="w-full border rounded p-2" value={details.movilidad} onChange={e => setDetails({...details, movilidad: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sueño</label>
                  <input required className="w-full border rounded p-2" value={details.sueno} onChange={e => setDetails({...details, sueno: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Consumo de Insumos Extra</label>
                <input required className="w-full border rounded p-2" value={details.insumos} onChange={e => setDetails({...details, insumos: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones Generales</label>
                <textarea 
                  required 
                  className="w-full border rounded-lg p-2 h-24" 
                  placeholder="Estado general..."
                  value={report} 
                  onChange={e => setReport(e.target.value)} 
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowEndModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-danger text-white rounded-lg">Guardar y Finalizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Historial de Turnos</h3>
        <div className="space-y-4">
          {shifts.slice().reverse().map(s => (
            <div key={s.id} className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3">
                    {s.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{s.userName}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{s.role}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Inicio:</strong> {s.date} {s.startTime}</p>
                  {s.status === 'completed' && <p><strong>Fin:</strong> {s.endDate || s.date} {s.endTime}</p>}
                </div>
              </div>
              
              <div className="flex-1 md:ml-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${s.status === 'completed' ? 'bg-health/10 text-health' : 'bg-warning/10 text-warning'}`}>
                    {s.status === 'completed' ? 'Finalizado' : 'En Curso'}
                  </span>
                </div>
                {s.status === 'completed' && s.report && (
                  <div className="space-y-2 text-sm text-gray-700">
                    {s.details && (
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-white p-2 rounded border">
                        <p><strong>Alim:</strong> {s.details.alimentacion}</p>
                        <p><strong>Hig:</strong> {s.details.higiene}</p>
                        <p><strong>Mov:</strong> {s.details.movilidad}</p>
                        <p><strong>Sueño:</strong> {s.details.sueno}</p>
                        <p className="col-span-2"><strong>Insumos:</strong> {s.details.insumos}</p>
                      </div>
                    )}
                    <p><strong>Observaciones:</strong> {s.report}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {shifts.length === 0 && <p className="text-gray-500 py-4 text-center">No hay turnos registrados.</p>}
        </div>
      </div>
    </div>
  );
}
