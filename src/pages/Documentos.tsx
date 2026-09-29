import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { FileText, Plus, X } from 'lucide-react';

import { hasPermission } from '../lib/permissions';
import { DocumentRecord } from '../types';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Documentos() {
  const { documents, addDocument, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Receta', professional: '', description: '' });
  const [viewDoc, setViewDoc] = useState<DocumentRecord | null>(null);

  useHardwareBack(showModal, () => setShowModal(false));
  useHardwareBack(!!viewDoc, () => setViewDoc(null));

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
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {viewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Metadatos del Documento</h3>
              <button onClick={() => setViewDoc(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <p><strong className="block text-xs text-gray-500 uppercase">Nombre</strong> {viewDoc.name}</p>
              <p><strong className="block text-xs text-gray-500 uppercase mt-2">Categoría</strong> {viewDoc.category}</p>
              <p><strong className="block text-xs text-gray-500 uppercase mt-2">Fecha</strong> {viewDoc.date}</p>
              <p><strong className="block text-xs text-gray-500 uppercase mt-2">Profesional</strong> {viewDoc.professional || 'N/A'}</p>
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-100">
                El archivo real no se encuentra disponible en la versión de demostración.
              </div>
            </div>
            <button onClick={() => setViewDoc(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold">Cerrar</button>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <p className="text-gray-500">Repositorio clínico</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} className="bg-primary text-white p-3 md:px-4 md:py-2 rounded-full md:rounded-lg flex items-center shadow-md font-bold hover:bg-primary-light">
            <Plus className="w-5 h-5 md:mr-1" /> <span className="hidden md:inline">Subir</span>
          </button>
        )}
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Subir Documento (Simulado)</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input required type="text" className="w-full border rounded-lg p-3 bg-gray-50" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select className="w-full border rounded-lg p-3 bg-gray-50" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Receta</option>
                  <option>Estudio</option>
                  <option>Análisis</option>
                  <option>Informe médico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profesional</label>
                <input type="text" className="w-full border rounded-lg p-3 bg-gray-50" value={form.professional} onChange={e => setForm({...form, professional: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 && <p className="text-gray-500 col-span-full text-center py-8 bg-white rounded-xl border border-dashed">No hay documentos guardados.</p>}
        {documents.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewDoc(doc)}>
            <div className="flex">
              <FileText className="w-10 h-10 text-primary/40 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                <p className="text-xs text-primary font-medium mb-2 uppercase tracking-wide">{doc.category}</p>
                <p className="text-sm text-gray-500">{doc.date} • {doc.professional}</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setViewDoc(doc); }} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Ver Metadatos">
              <FileText className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
