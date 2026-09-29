import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { Activity, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { VitalSign } from '../types';
import { hasPermission } from '../lib/permissions';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Controles() {
  const { vitalSigns, addVitalSign, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'pressure', value: '', unit: 'mmHg' });
  const [errorMsg, setErrorMsg] = useState('');

  useHardwareBack(showModal, () => setShowModal(false));
  useHardwareBack(!!errorMsg, () => setErrorMsg(''));

  const types = [
    { id: 'pressure', label: 'Presión Arterial', unit: 'mmHg', placeholder: '120/80', regex: /^\d{2,3}\/\d{2,3}$/ },
    { id: 'temperature', label: 'Temperatura', unit: '°C', placeholder: '36.5', regex: /^\d{2}(\.\d)?$/ },
    { id: 'glucose', label: 'Glucemia', unit: 'mg/dL', placeholder: '90', regex: /^\d{2,3}$/ },
    { id: 'heartRate', label: 'Frecuencia Cardíaca', unit: 'lpm', placeholder: '75', regex: /^\d{2,3}$/ },
    { id: 'saturation', label: 'Saturación', unit: '%', placeholder: '98', regex: /^\d{2,3}$/ },
    { id: 'weight', label: 'Peso', unit: 'kg', placeholder: '70', regex: /^\d{2,3}(\.\d{1,2})?$/ },
    { id: 'respiratoryRate', label: 'Frec. Respiratoria', unit: 'rpm', placeholder: '16', regex: /^\d{2}$/ },
  ];

  const canWrite = currentUser && hasPermission(currentUser.role, 'register_vitals');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value || !canWrite) return;
    
    const typeObj = types.find(t => t.id === form.type);
    if (typeObj && typeObj.regex && !typeObj.regex.test(form.value)) {
      setErrorMsg(`Formato inválido para ${typeObj.label}. Ejemplo: ${typeObj.placeholder}`);
      return;
    }
    
    addVitalSign({
      id: Date.now().toString(),
      date: getLocalDateString(),
      time: getLocalTimeString(),
      type: form.type as any,
      value: form.value,
      unit: typeObj?.unit || '',
      registeredBy: currentUser?.name || 'Usuario'
    });
    setForm({ type: 'pressure', value: '', unit: 'mmHg' });
    setShowModal(false);
  };

  const getTrend = (current: VitalSign) => {
    const sameType = vitalSigns.filter(v => v.type === current.type).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
    const currentIndex = sameType.findIndex(v => v.id === current.id);
    if (currentIndex === -1 || currentIndex === sameType.length - 1) return null;

    const prev = sameType[currentIndex + 1];
    
    if (current.type === 'pressure') {
      const [cs, cd] = current.value.split('/').map(Number);
      const [ps, pd] = prev.value.split('/').map(Number);
      if (cs > ps || cd > pd) return 'up';
      if (cs < ps || cd < pd) return 'down';
      return 'flat';
    }

    const cv = Number(current.value);
    const pv = Number(prev.value);
    if (cv > pv) return 'up';
    if (cv < pv) return 'down';
    return 'flat';
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      
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

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Signos Vitales</h2>
          <p className="text-gray-500">Registro histórico</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} className="bg-primary text-white p-3 md:px-4 md:py-2 rounded-full md:rounded-lg flex items-center shadow-md hover:bg-primary-light">
            <Plus className="w-5 h-5 md:mr-1" /> <span className="hidden md:inline">Nuevo</span>
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Control</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de control</label>
                <select 
                  className="w-full border rounded-lg p-3 bg-gray-50" 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value, unit: types.find(t => t.id === e.target.value)?.unit || '' })}
                >
                  {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor ({form.unit})</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border rounded-lg p-3 bg-gray-50" 
                  placeholder={types.find(t => t.id === form.type)?.placeholder}
                  value={form.value} 
                  onChange={e => setForm({ ...form, value: e.target.value })} 
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-4">
        {vitalSigns.length === 0 && <p className="text-gray-500 py-4 text-center">No hay registros.</p>}
        {vitalSigns.sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time)).map(v => {
          const trend = getTrend(v);
          return (
            <div key={v.id} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center">
                <Activity className="w-10 h-10 p-2 rounded-full bg-info/10 text-info mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{types.find(t => t.id === v.type)?.label || v.type}</p>
                  <p className="text-xs text-gray-500">{v.date} {v.time} • {v.registeredBy}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-danger" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-health" />}
                {trend === 'flat' && <Minus className="w-4 h-4 text-gray-400" />}
                <div className="text-lg font-bold w-20 text-right text-gray-900">{v.value} <span className="text-sm font-normal text-gray-500">{v.unit}</span></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
