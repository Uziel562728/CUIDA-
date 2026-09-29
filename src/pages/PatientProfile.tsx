import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, Phone, MapPin, Activity, Stethoscope } from 'lucide-react';
import { hasPermission } from '../lib/permissions';

export default function PatientProfile() {
  const { patient, updatePatient, currentUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...patient });

  const canEdit = currentUser && hasPermission(currentUser.role, 'manage_patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ficha del Paciente</h2>
        {canEdit && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Editar paciente
          </button>
        )}
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Editando Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input required className="w-full border p-2 rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input required className="w-full border p-2 rounded-lg" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contacto Principal</label>
                <input required className="w-full border p-2 rounded-lg" value={form.mainContact} onChange={e => setForm({...form, mainContact: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tel. Principal</label>
                <input required className="w-full border p-2 rounded-lg" value={form.mainContactPhone} onChange={e => setForm({...form, mainContactPhone: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 font-medium">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Guardar Cambios</button>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-primary/5 px-6 py-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 border-b border-gray-100">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold text-gray-900">{patient.name}</h3>
                <p className="text-lg text-gray-600 mt-1">{patient.age} años • Nacido el {patient.birthDate}</p>
                <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {patient.address}</span>
                  <span className="flex items-center mt-1 md:mt-0"><Heart className="w-4 h-4 mr-1 text-danger" /> Grupo: {patient.bloodType}</span>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-4">
                    <Phone className="w-4 h-4 mr-2" /> Contactos
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Contacto Principal</p>
                        <p className="font-medium text-gray-900">{patient.mainContact}</p>
                      </div>
                      <a href={`tel:${patient.mainContactPhone}`} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"><Phone className="w-5 h-5"/></a>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-red-400 mb-1">Contacto de Emergencia</p>
                        <p className="font-medium text-red-900">{patient.emergencyContact}</p>
                      </div>
                      <a href={`tel:${patient.emergencyContactPhone}`} className="text-danger hover:bg-danger/10 p-2 rounded-full transition-colors"><Phone className="w-5 h-5"/></a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-4">
                    <Stethoscope className="w-4 h-4 mr-2" /> Equipo Médico Principal
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{patient.doctor}</p>
                        <p className="text-xs text-gray-500">Médico Clínico</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{patient.healthInsurance}</p>
                        <p className="text-xs text-gray-500">Obra Social / Prepaga</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center mb-4">
                  <Activity className="w-4 h-4 mr-2" /> Información Médica
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Diagnósticos</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.diagnoses.map((d, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-danger/10 text-danger text-sm rounded-full font-medium">
                          {a}
                        </span>
                      ))}
                      {patient.allergies.length === 0 && <span className="text-gray-500 text-sm">Ninguna registrada</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Observaciones Generales</p>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100">
                      {patient.observations}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
