import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, formatTime12h, formatDateDDMMYYYY } from '../utils/date';
import { CalendarClock, CheckCircle, Circle, Plus, Trash2, Edit2 } from 'lucide-react';
import { Reminder } from '../types';
import { hasPermission } from '../lib/permissions';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Recordatorios() {
  const { reminders, addReminder, completeReminder, deleteReminder, updateReminder, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', type: 'general', time: '10:00', date: getLocalDateString(), repeat: 'once' });

  const canManage = currentUser && (hasPermission(currentUser.role, 'manage_reminders') || currentUser.role === 'admin');

  const openNew = () => {
    setEditingId(null);
    setForm({ title: '', type: 'general', time: '10:00', date: getLocalDateString(), repeat: 'once' });
    setShowModal(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setForm({ title: r.title, type: r.type, time: r.time, date: r.date, repeat: r.repeat });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    
    if (editingId) {
      updateReminder(editingId, {
        title: form.title,
        type: form.type as any,
        date: form.date,
        time: form.time,
        repeat: form.repeat as any,
      });
    } else {
      addReminder({
        id: Date.now().toString(),
        title: form.title,
        type: form.type as any,
        date: form.date,
        time: form.time,
        repeat: form.repeat as any,
        status: 'pending'
      });
    }
    setShowModal(false);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useHardwareBack(showModal, () => setShowModal(false));
  useHardwareBack(!!deleteConfirm, () => setDeleteConfirm(null));
  const handleComplete = (id: string, repeat: string) => {
    if (!canManage) return;
    completeReminder(id);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteReminder(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const todayStr = getLocalDateString();
  const visibleReminders = reminders.filter(r => {
    if (r.status === 'cancelled') return false;
    if (r.repeat === 'once') return r.date === todayStr;
    if (r.repeat === 'daily') return r.date <= todayStr;
    return false;
  }).map(r => {
    if (r.repeat === 'daily') {
      const isCompletedToday = r.history && r.history.some(h => h.date === todayStr);
      return { ...r, status: isCompletedToday ? 'completed' as const : 'pending' as const };
    }
    return r;
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recordatorios</h2>
          <p className="text-gray-500">Agenda diaria de tareas</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="w-5 h-5 mr-1" /> Nuevo
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input required type="date" className="w-full border rounded-lg p-2" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <input required type="time" className="w-full border rounded-lg p-2" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repetición</label>
                <select className="w-full border rounded-lg p-2" value={form.repeat} onChange={e => setForm({...form, repeat: e.target.value})}>
                  <option value="once">Solo una vez</option>
                  <option value="daily">Diario</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Recordatorio</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro que deseas eliminar este recordatorio? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-danger text-white rounded-xl font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleReminders.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay recordatorios pendientes para hoy.</p>
        )}
        {visibleReminders.sort((a,b) => a.time.localeCompare(b.time)).map(r => (
          <div key={r.id} className={`bg-white rounded-xl p-4 flex items-center justify-between border ${r.status === 'completed' ? 'opacity-60' : ''}`}>
            <div className="flex items-center">
              <button 
                onClick={() => r.status === 'pending' && handleComplete(r.id, r.repeat)} 
                className={`mr-3 ${canManage ? 'text-primary cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                disabled={!canManage}
              >
                {r.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>
              <div>
                <p className={`font-bold ${r.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{r.title}</p>
                <p className="text-sm text-gray-500">{r.date === todayStr ? 'Hoy' : formatDateDDMMYYYY(r.date)} - {formatTime12h(r.time)} {r.repeat === 'daily' ? '(Diario)' : ''}</p>
              </div>
            </div>
            {canManage && (
              <div className="flex space-x-2">
                <button onClick={() => openEdit(r)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-danger transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
