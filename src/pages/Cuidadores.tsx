import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Phone, Plus, Edit2, Trash2 } from 'lucide-react';
import { hasPermission } from '../lib/permissions';

export default function Cuidadores() {
  const { caregivers, addCaregiver, updateCaregiver, deleteCaregiver, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: 'Enfermera/o', phone: '', days: 'Lunes a Viernes', schedule: '08:00 a 16:00' });

  const canManage = currentUser && hasPermission(currentUser.role, 'manage_caregivers');

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', role: 'Enfermera/o', phone: '', days: 'Lunes a Viernes', schedule: '08:00 a 16:00' });
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ name: c.name, role: c.role, phone: c.phone, days: c.days, schedule: c.schedule });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    if (editingId) {
      updateCaregiver(editingId, { ...form });
    } else {
      addCaregiver({ id: Date.now().toString(), ...form });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar cuidador?')) deleteCaregiver(id);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipo de Cuidado</h2>
          <p className="text-gray-500">Gestión de enfermeros y cuidadores</p>
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
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Cuidador' : 'Nuevo Cuidador'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {caregivers.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{c.name}</h3>
              <p className="text-primary text-sm font-medium mb-2">{c.role}</p>
              <p className="text-sm text-gray-600"><strong>Días:</strong> {c.days}</p>
              <p className="text-sm text-gray-600 mb-3"><strong>Horario:</strong> {c.schedule}</p>
              <a href={`tel:${c.phone}`} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 mr-1" /> Llamar {c.phone}
              </a>
            </div>
            {canManage && (
              <div className="flex flex-col space-y-2 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-danger transition-colors">
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
