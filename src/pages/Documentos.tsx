import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { FileText, Plus } from 'lucide-react';

import { hasPermission } from '../lib/permissions';

export default function Documentos() {
  const { documents, addDocument, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Receta', professional: '', description: '' });

  const canWrite = currentUser && (hasPermission(currentUser.role, 'manage_documents') || currentUser.role === 'admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    addDocument({
      id: Date.now().toString(),
      date: getLocalDateString(),
      name: form.name,
      category: form.category,
      professional: form.professional,
      description: form.description
    });
    setShowModal(false);
    setForm({ name: '', category: 'Receta', professional: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <p className="text-gray-500">Repositorio clínico</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center font-bold">
            <Plus className="w-5 h-5 mr-1" /> Subir
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Subir Documento (Simulado)</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select className="w-full border rounded-lg p-2" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Receta</option>
                  <option>Estudio</option>
                  <option>Análisis</option>
                  <option>Informe médico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profesional</label>
                <input type="text" className="w-full border rounded-lg p-2" value={form.professional} onChange={e => setForm({...form, professional: e.target.value})} />
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
        {documents.length === 0 && <p className="text-gray-500 col-span-full text-center py-8 bg-white rounded-xl border">No hay documentos guardados.</p>}
        {documents.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start justify-between">
            <div className="flex">
              <FileText className="w-10 h-10 text-primary/40 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                <p className="text-xs text-primary font-medium mb-2">{doc.category}</p>
                <p className="text-sm text-gray-500">{doc.date} • {doc.professional}</p>
              </div>
            </div>
            <button onClick={() => alert(`Visualizando metadatos:\n\n${doc.name}\nCategoría: ${doc.category}\nFecha: ${doc.date}\nProfesional: ${doc.professional}\n\n[El archivo real no se encuentra disponible en la demo]`)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Ver Metadatos">
              <FileText className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
