import React from 'react';
import { useStore } from '../store/useStore';
import { Settings, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { hasPermission } from '../lib/permissions';

export default function Configuracion() {
  const { resetDemoData, setCurrentUser, currentUser } = useStore();
  const navigate = useNavigate();

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todos los datos ficticios de la demostración a su estado inicial? Esta acción no se puede deshacer.')) {
      resetDemoData();
      alert('Datos restablecidos. Sesión finalizada.');
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const isAdmin = currentUser && hasPermission(currentUser.role, 'reset_data');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-500">Ajustes de la plataforma de demostración</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {isAdmin && (
          <>
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
                <RefreshCw className="w-5 h-5 mr-2 text-warning" />
                Datos de Demostración
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta aplicación utiliza almacenamiento local (IndexedDB/localStorage) para mantener los datos de prueba entre recargas. Si encuentras algún error en los datos o deseas volver al estado inicial del MVP, puedes restablecer los datos.
              </p>
              <button 
                onClick={handleReset}
                className="w-full sm:w-auto bg-warning text-white px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
              >
                Restablecer Datos de Demostración
              </button>
            </div>
            <hr className="border-gray-100" />
          </>
        )}

        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Preferencias de la App (Simuladas)
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 mr-3 accent-primary" defaultChecked />
              <span>Notificaciones Push</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 mr-3 accent-primary" defaultChecked />
              <span>Tema Claro / Oscuro Automático</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-5 h-5 mr-3 accent-primary" />
              <span>Modo Alto Contraste</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
