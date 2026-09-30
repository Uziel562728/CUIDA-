import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings, RefreshCw, AlertTriangle, Moon, Sun, Monitor, Bell, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { hasPermission } from '../lib/permissions';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const COLORS = [
  { id: '#1E3A5F', name: 'Azul Petróleo' },
  { id: '#27AE60', name: 'Verde Salud' },
  { id: '#8E44AD', name: 'Púrpura' },
  { id: '#E67E22', name: 'Naranja' },
  { id: '#C0392B', name: 'Rojo' }
];

export default function Configuracion() {
  const { 
    resetDemoData, setCurrentUser, currentUser, 
    theme, setTheme, 
    primaryColor, setPrimaryColor,
    notificationsEnabled, setNotificationsEnabled 
  } = useStore();
  
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [sysPerm, setSysPerm] = useState<string>('prompt');
  
  useHardwareBack(showConfirm, () => setShowConfirm(false));

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then(res => setSysPerm(res.display));
    }
  }, [notificationsEnabled]);

  const handleReset = () => {
    resetDemoData();
    setCurrentUser(null);
    navigate('/login');
  };

  const handleToggleNotifications = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked && Capacitor.isNativePlatform()) {
      try {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          perm = await LocalNotifications.requestPermissions();
        }
        setSysPerm(perm.display);
        if (perm.display === 'granted') {
          setNotificationsEnabled(true);
        } else {
          // No concedido
          setNotificationsEnabled(false);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setNotificationsEnabled(checked);
    }
  };

  const isAdmin = currentUser && hasPermission(currentUser.role, 'reset_data');

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Restablecer Datos</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              ¿Estás seguro de que deseas restablecer todos los datos ficticios? Esta acción cerrará tu sesión.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-3 rounded-xl font-bold">Cancelar</button>
              <button onClick={handleReset} className="flex-1 bg-warning text-white hover:bg-yellow-600 px-4 py-3 rounded-xl font-bold">Restablecer</button>
            </div>
          </div>
        </div>
      )}

      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h2>
        <p className="text-gray-500 dark:text-gray-400">Preferencias personales y de sistema</p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        
        {/* APARIENCIA */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-4">
            <Palette className="w-5 h-5 mr-2 text-primary" />
            Apariencia
          </h3>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setTheme('light')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Sun className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Claro</span>
              </button>
              <button onClick={() => setTheme('dark')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Moon className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Oscuro</span>
              </button>
              <button onClick={() => setTheme('system')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Monitor className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Sistema</span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color principal</p>
            <div className="flex space-x-3">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPrimaryColor(c.id)}
                  style={{ backgroundColor: c.id }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${primaryColor === c.id ? 'ring-4 ring-offset-2 ring-primary/50 scale-110' : 'hover:scale-105'}`}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* NOTIFICACIONES */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2 text-primary" />
            Notificaciones
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permitir recordatorios locales</span>
              <div className="relative inline-block w-12 h-6 rounded-full">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
                <span className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors peer-checked:bg-primary"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></span>
              </div>
            </label>
            
            {Capacitor.isNativePlatform() && sysPerm !== 'granted' && (
              <div className="text-xs text-warning bg-warning/10 p-3 rounded-lg border border-warning/20">
                El sistema bloquea las notificaciones de la app. Para recibirlas, debes activarlas manualmente desde la configuración de tu teléfono.
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-4">
                <RefreshCw className="w-5 h-5 mr-2 text-warning" />
                Datos de Demostración
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Esta acción borrará toda la información generada y volverá al estado inicial.
              </p>
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full sm:w-auto bg-warning text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
              >
                Restablecer Datos de Demostración
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
