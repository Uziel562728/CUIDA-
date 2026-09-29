import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { Pill, Calendar, AlertCircle, Package, Droplet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasPermission } from '../lib/permissions';
import { calculateEstimatedConsumption } from '../utils/stock';

export default function Dashboard() {
  const { currentUser, patient, doses, treatments, timeline, logDose, products, incidents, vitalSigns } = useStore();
  const [showToast, setShowToast] = useState(false);

  const todayStr = getLocalDateString();
  const todaysDoses = doses.filter(d => d.date === todayStr).sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const pendingDoses = todaysDoses.filter(d => d.status === 'pending');
  const todaysTimeline = timeline.filter(t => t.date === todayStr).slice(0, 6);
  
  const lastVital = vitalSigns.length > 0 ? vitalSigns[0] : null;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

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
      if (logDose(doseId, status, currentUser?.name || 'Sistema', obs)) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 md:right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Registro guardado correctamente.
          </motion.div>
        )}
      </AnimatePresence>

      <header>
        <h2 className="text-2xl font-bold text-gray-900">
          Buenas tardes, {currentUser?.name.split(' ')[0]}
        </h2>
        <p className="text-gray-500">Resumen de {patient.name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Medication */}
        {pendingDoses.length > 0 ? (
          (() => {
            const nextDose = pendingDoses[0];
            const treat = treatments.find(t => t.id === nextDose.treatmentId);
            return (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-primary font-medium mb-2">
                    <Pill className="w-5 h-5 mr-2" />
                    Próxima dosis ({nextDose.scheduledTime})
                  </div>
                  <p className="text-lg font-bold text-gray-900">{treat?.medicationName} {treat?.presentation}</p>
                  <p className="text-gray-500">{treat?.quantityPerDose} {treat?.unit}</p>
                </div>
                {currentUser && hasPermission(currentUser.role, 'administer_medication') && (
                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => handleLogDose(nextDose.id, 'taken')}
                      className="flex-1 bg-health/10 text-health hover:bg-health hover:text-white py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Tomada
                    </button>
                    <button 
                      onClick={() => handleLogDose(nextDose.id, 'missed')}
                      className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Omitida
                    </button>
                  </div>
                )}
              </div>
            )
          })()
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-10 h-10 text-health mb-2" />
            <p className="font-bold text-gray-900">Al día</p>
            <p className="text-sm text-gray-500">No hay dosis pendientes.</p>
          </div>
        )}

        {/* Alerts */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-danger font-medium mb-3">
            <AlertCircle className="w-5 h-5 mr-2" />
            Alertas Reales
          </div>
          <ul className="space-y-3 text-sm">
            {products.map(p => {
              const daily = calculateEstimatedConsumption(p, treatments);
              const estDays = daily > 0 ? (p.currentQuantity / daily) : null;
              const isLow = (estDays !== null && estDays <= 5) || (p.minStock && p.currentQuantity <= p.minStock);
              
              if (isLow) {
                return (
                  <li key={p.id} className="flex items-start">
                    <Package className="w-4 h-4 text-warning mr-2 mt-0.5 flex-shrink-0" />
                    <span>{p.name}: <strong className="text-gray-900">{p.currentQuantity} {p.unit}</strong> (Stock bajo).</span>
                  </li>
                );
              }
              return null;
            })}
            {activeIncidents.map(i => (
              <li key={i.id} className="flex items-start">
                <AlertCircle className="w-4 h-4 text-danger mr-2 mt-0.5 flex-shrink-0" />
                <span>Incidente: {i.type} activo.</span>
              </li>
            ))}
            {products.every(p => {
              const daily = calculateEstimatedConsumption(p, treatments);
              const estDays = daily > 0 ? (p.currentQuantity / daily) : null;
              return !((estDays !== null && estDays <= 5) || (p.minStock && p.currentQuantity <= p.minStock));
            }) && activeIncidents.length === 0 && (
              <li className="text-gray-500 text-center py-2">No hay alertas críticas.</li>
            )}
          </ul>
        </div>

        {/* Agenda */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto max-h-48 no-scrollbar">
          <div className="flex items-center text-secondary font-medium mb-3 sticky top-0 bg-white">
            <Calendar className="w-5 h-5 mr-2" />
            Agenda ({todaysDoses.length})
          </div>
          <div className="space-y-2">
            {todaysDoses.map(d => {
              const t = treatments.find(tr => tr.id === d.treatmentId);
              return (
                <div key={d.id} className="flex justify-between items-center border-b border-gray-50 pb-1">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{d.scheduledTime}</span> - {t?.medicationName}
                  </div>
                  {d.status === 'taken' && <CheckCircle className="w-4 h-4 text-health" />}
                  {d.status === 'missed' && <XCircle className="w-4 h-4 text-gray-400" />}
                  {d.status === 'pending' && <Clock className="w-4 h-4 text-warning" />}
                </div>
              );
            })}
            {todaysDoses.length === 0 && <p className="text-sm text-gray-500">Sin programación hoy.</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center text-info font-medium mb-3">
            <Droplet className="w-5 h-5 mr-2" />
            Último control
          </div>
          {lastVital ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-gray-500">{lastVital.type}</span>
                <span className="font-semibold text-gray-900">{lastVital.value} {lastVital.unit}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">{lastVital.date} {lastVital.time}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin controles registrados.</p>
          )}
        </div>
      </div>

      {/* HOY Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Eventos de HOY
          </h3>
        </div>
        
        <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-6">
          {todaysTimeline.length === 0 ? (
            <p className="text-gray-500 ml-4">No hay eventos registrados hoy.</p>
          ) : (
            todaysTimeline.map((event) => (
              <div key={event.id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                  event.type === 'incident' ? 'bg-danger' : 
                  event.type === 'medication' ? 'bg-health' : 
                  event.type === 'shift' ? 'bg-primary' : 
                  event.type === 'order' ? 'bg-secondary' : 'bg-gray-400'
                }`}></div>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{event.time}</span>
                    <h4 className="font-medium text-gray-800">{event.description}</h4>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 md:mt-0">{event.user}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
