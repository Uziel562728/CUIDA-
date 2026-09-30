import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { HeartPulse } from 'lucide-react';
import { User } from '../types';
import { motion } from 'framer-motion';

const demoUsers: User[] = [
  { id: 'u1', name: 'Martín Pérez', role: 'admin', email: 'martin@cuida.com' },
  { id: 'u2', name: 'Laura Pérez', role: 'family', email: 'laura@cuida.com' },
  { id: 'u3', name: 'María González', role: 'nurse', email: 'maria@cuida.com' },
  { id: 'u4', name: 'Dr. Carlos Gómez', role: 'doctor', email: 'carlos@cuida.com' },
  { id: 'u5', name: 'Farmacia Central', role: 'supplier', email: 'farmacia@cuida.com', providerId: 'prov1' },
  { id: 'u6', name: 'Farmacia Norte', role: 'supplier', email: 'norte@cuida.com', providerId: 'prov2' },
];

export default function Login() {
  const { setCurrentUser, generateDosesForDay } = useStore();
  const navigate = useNavigate();

  // En la demo generamos las dosis del día al ver la pantalla de login (simulando backend de medianoche)
  useEffect(() => {
    generateDosesForDay(getLocalDateString());
  }, [generateDosesForDay]);

  const handleLogin = async (user: User) => {
    
    
    // Configuración inicial de notificaciones
    const storeState = useStore.getState();
    if (Capacitor.isNativePlatform() && !storeState.notificationsPermissionRequested) {
      try {
        const permStatus = await LocalNotifications.requestPermissions();
        storeState.setNotificationsPermissionRequested(true);
        if (permStatus.display === 'granted') {
          storeState.setNotificationsEnabled(true);
        }
      } catch (e) {
        console.warn('LocalNotifications permission request failed:', e);
      }
    }

    // In a real app we would check the 'remember me' checkbox
    setCurrentUser(user);
    if (user.role === 'supplier') {
      navigate('/proveedor');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-health rounded-full opacity-10 blur-3xl"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <HeartPulse className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Bienvenido a CUIDA+
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Plataforma integral de cuidado domiciliario
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">Ingresar como usuario demo</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {demoUsers.map((user) => {
                let roleName = '';
                if(user.role === 'admin') roleName = 'Familiar Administrador';
                else if(user.role === 'family') roleName = 'Familiar (Lectura)';
                else if(user.role === 'nurse') roleName = 'Enfermero/a';
                else if(user.role === 'doctor') roleName = 'Médico';
                else if(user.role === 'supplier') roleName = 'Proveedor';

                return (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user)}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold mr-2">{roleName}</span>
                    <span className="text-gray-500">- {user.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            Almacenamiento local (Persist) activado.
          </div>
        </div>
      </div>
    </div>
  );
}
