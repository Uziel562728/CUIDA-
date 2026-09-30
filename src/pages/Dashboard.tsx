import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, formatTime12h } from '../utils/date';
import { Pill, Calendar, AlertCircle, Package, Clock, CheckCircle, ChevronRight, PlayCircle, StopCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '../lib/permissions';
import { calculateEstimatedConsumption } from '../utils/stock';

export default function Dashboard() {
  const { currentUser, patient, doses, treatments, timeline, products, incidents, shifts } = useStore();
  const navigate = useNavigate();
  const todayStr = getLocalDateString();
  
  const todaysDoses = doses.filter(d => d.date === todayStr).sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const pendingDoses = todaysDoses.filter(d => d.status === 'pending');
  const nextDose = pendingDoses.length > 0 ? pendingDoses[0] : null;
  const nextTreatment = nextDose ? treatments.find(t => t.id === nextDose.treatmentId) : null;

  const todaysTimeline = timeline.filter(t => t.date === todayStr);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  // Compute alerts
  let rawAlerts: {id: string, text: string, type: 'danger'|'warning'}[] = [];
  activeIncidents.forEach(i => {
    rawAlerts.push({ id: `inc_${i.id}`, text: `Incidente activo: ${i.type}`, type: 'danger' });
  });
  products.forEach(p => {
    const daily = calculateEstimatedConsumption(p, treatments);
    const estDays = daily > 0 ? (p.currentQuantity / daily) : null;
    if ((estDays !== null && estDays <= 5) || (p.minStock && p.currentQuantity <= p.minStock)) {
      rawAlerts.push({ id: `stk_${p.id}`, text: `${p.name}: Stock bajo (${p.currentQuantity} ${p.unit})`, type: 'warning' });
    }
  });

  const alerts = rawAlerts.slice(0, 3);
  const extraAlerts = rawAlerts.length > 3 ? rawAlerts.length - 3 : 0;

  // Caregiver shift logic
  const isCaregiver = currentUser?.role === 'nurse';
  const activeShift = isCaregiver ? shifts.find(s => s.status === 'active' && s.userId === currentUser?.id) : null;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10">
      
      {/* 1. Paciente actual */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mr-4">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Paciente</p>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">Prueba de actualización: OK</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{patient.name}</h2>
          </div>
        </div>
      </div>

      {/* 2. Situaciones que requieren atención (Alertas) */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center">
            <AlertCircle className="w-5 h-5 text-danger mr-2" />
            <h3 className="font-bold text-danger">Requiere atención</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {alerts.map(a => (
              <li key={a.id} className="p-4 text-sm text-gray-800 flex items-start">
                <span className={`w-2 h-2 mt-1.5 rounded-full mr-3 flex-shrink-0 ${a.type === 'danger' ? 'bg-danger' : 'bg-warning'}`}></span>
                {a.text}
              </li>
            ))}
            {extraAlerts > 0 && (
              <li 
                onClick={() => navigate(rawAlerts[0].type === 'danger' ? '/incidentes' : '/stock')}
                className="p-3 text-center text-sm font-medium text-primary hover:bg-gray-50 cursor-pointer"
              >
                Ver {extraAlerts} más...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Cuidador: Mi turno */}
      {isCaregiver && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Mi Turno</h3>
            <p className="text-sm text-gray-600">
              {activeShift ? `En curso desde las ${formatTime12h(activeShift.startTime)}` : 'No tienes un turno activo'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/turnos')}
            className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-sm transition-transform active:scale-95 ${activeShift ? 'bg-danger' : 'bg-primary'}`}
          >
            {activeShift ? <StopCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* 3. Próxima tarea o dosis pendiente */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center text-primary font-medium mb-3">
          <Pill className="w-5 h-5 mr-2" />
          Próxima Tarea
        </div>
        {nextDose && nextTreatment ? (
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatTime12h(nextDose.scheduledTime)}</p>
            <p className="text-lg font-medium text-gray-800">{nextTreatment.medicationName} {nextTreatment.presentation}</p>
            <p className="text-gray-500">{nextTreatment.quantityPerDose} {nextTreatment.unit}</p>
            
            {currentUser && hasPermission(currentUser.role, 'administer_medication') && (
              <button 
                onClick={() => navigate('/timeline')}
                className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary hover:text-white py-3 rounded-xl font-bold transition-colors"
              >
                Ir a Registrar
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="w-10 h-10 text-health mb-2" />
            <p className="font-bold text-gray-900">Todo al día</p>
            <p className="text-sm text-gray-500">No hay dosis pendientes.</p>
          </div>
        )}
      </div>

      {/* 4. Resumen breve del día & 5. Acceso al historial */}
      <div 
        onClick={() => navigate('/timeline')}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-primary/30 transition-colors flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold text-gray-900 mb-1 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            Resumen de Hoy
          </h3>
          <p className="text-sm text-gray-500">
            {todaysTimeline.length} eventos registrados.
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

    </div>
  );
}
