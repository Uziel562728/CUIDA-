import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useStore } from './store/useStore';
import AppLayout from './components/layout/AppLayout';
import ProviderLayout from './components/layout/ProviderLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import Medications from './pages/Medications';
import Timeline from './pages/Timeline';
import Stock from './pages/Stock';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Mas from './pages/Mas';
import Controles from './pages/Controles';
import Recordatorios from './pages/Recordatorios';
import Turnos from './pages/Turnos';
import Horas from './pages/Horas';
import ProviderPedidos from './pages/ProviderPedidos';
import ProviderCatalogo from './pages/ProviderCatalogo';
import ProviderCotizaciones from './pages/ProviderCotizaciones';
import ProviderMas from './pages/ProviderMas';
import Cuidadores from './pages/Cuidadores';
import Incidentes from './pages/Incidentes';
import Documentos from './pages/Documentos';
import Configuracion from './pages/Configuracion';
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2">Módulo en construcción para esta demo.</p>
  </div>
);

function App() {
  const { theme, primaryColor, currentUser, notificationsPermissionRequested, setNotificationsPermissionRequested, setNotificationsEnabled } = useStore();

  
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };
    
    applyTheme();
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
    
    root.style.setProperty('--primary-custom', primaryColor);
  }, [theme, primaryColor]);

  // Request notifications permission exactly once when a user is logged in
  useEffect(() => {
    const checkPerms = async () => {
      if (currentUser && Capacitor.isNativePlatform() && !notificationsPermissionRequested) {
        if (Capacitor.isPluginAvailable('LocalNotifications')) {
          try {
            const permStatus = await LocalNotifications.requestPermissions();
            setNotificationsPermissionRequested(true);
            if (permStatus.display === 'granted') {
              setNotificationsEnabled(true);
            }
          } catch (e) {
            console.warn('LocalNotifications plugin available but request failed:', e);
          }
        }
      }
    };
    checkPerms();
  }, [currentUser, notificationsPermissionRequested, setNotificationsPermissionRequested, setNotificationsEnabled]);


  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady();
    }
    const handleBackButton = async (event: { canGoBack: boolean }) => {
      // Create a custom event that can be cancelled
      const customEvent = new CustomEvent('hardwareBackPress', { cancelable: true });
      window.dispatchEvent(customEvent);
      
      if (customEvent.defaultPrevented) {
        // Un modal o wizard interceptó el botón atrás
        return;
      }

      if (event.canGoBack) {
        // Estamos en una ruta con historial
        window.history.back();
      } else {
        // En la raíz, en vez de salir de golpe, podríamos preguntar
        // pero dado que no queremos usar confirm nativo, 
        // simplemente no salimos a menos que disparemos un modal global.
        // Por ahora, como se pide evitar salida accidental, lo ignoramos o simulamos.
        // Podríamos permitir salir si es la pantalla de login, o dashboard.
        // Dado el alcance, emitiremos un evento de salir, o simplemente nada.
      }
    };

    // Solo eliminamos el listener que agregamos (aunque removeListener retorna una promesa, la omitimos en un unmount simple de web, pero en React 18+ strict mode puede correr dos veces, por lo que devolvemos la función de limpieza que guarda el listener real si usáramos la promesa, pero addListener en Capacitor 3+ retorna un objeto con .remove()).
    let listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="paciente" element={<PatientProfile />} />
          <Route path="medicacion" element={<Medications />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="stock" element={<Stock />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="mas" element={<Mas />} />
          <Route path="controles" element={<Controles />} />
          <Route path="recordatorios" element={<Recordatorios />} />
          <Route path="turnos" element={<Turnos />} />
          <Route path="horas" element={<Horas />} />
          
          <Route path="cuidadores" element={<Cuidadores />} />
          <Route path="incidentes" element={<Incidentes />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
        
        <Route path="/proveedor" element={<ProviderLayout />}>
          <Route index element={<ProviderPedidos />} />
          <Route path="pedidos" element={<ProviderPedidos />} />
          <Route path="catalogo" element={<ProviderCatalogo />} />
          <Route path="cotizaciones" element={<ProviderCotizaciones />} />
          <Route path="mas" element={<ProviderMas />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
