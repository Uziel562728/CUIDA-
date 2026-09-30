import React from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { canAccessRoute } from '../../lib/permissions';

export default function AppLayout() {
  const { currentUser, setCurrentUser, patient, generateDosesForDay } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'supplier') {
      const checkDay = () => {
        // getLocalDateString is defined in useStore, we need to import it or recreate it
        const todayStr = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getFullYear() + '-' + String(new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })).getDate()).padStart(2, '0');
        generateDosesForDay(todayStr);
      };
      
      checkDay();
      
      // Check periodically for day change (e.g. every minute)
      const interval = setInterval(checkDay, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser, generateDosesForDay]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'supplier') {
    return <Navigate to="/proveedor" replace />;
  }
  
  if (!canAccessRoute(currentUser.role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-64">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-primary hidden md:block">CUIDA+</h1>
            <div className="md:hidden">
              <span className="text-sm text-gray-500">Paciente:</span>
              <span className="ml-2 font-medium text-primary">{patient.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button aria-label="Notificaciones" className="relative p-2 text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <Settings className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="hidden md:flex items-center text-gray-500 hover:text-danger transition-colors focus:outline-none focus:ring-2 focus:ring-danger rounded px-2 py-1"
            >
              <LogOut className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
