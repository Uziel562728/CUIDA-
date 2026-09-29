import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CalendarClock, Activity, Users, Calendar, AlertTriangle, Package, ShoppingCart, FileText, BarChart, Settings, LogOut } from 'lucide-react';
import { canAccessRoute } from '../lib/permissions';

export default function Mas() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const menuItems = [
    { icon: CalendarClock, label: 'Recordatorios', path: '/recordatorios' },
    { icon: Activity, label: 'Controles', path: '/controles' },
    { icon: Users, label: 'Cuidadores', path: '/cuidadores' },
    { icon: Calendar, label: 'Turnos', path: '/turnos' },
    { icon: AlertTriangle, label: 'Incidentes', path: '/incidentes' },
    { icon: Package, label: 'Stock', path: '/stock' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/pedidos' },
    { icon: FileText, label: 'Documentos', path: '/documentos' },
    { icon: BarChart, label: 'Reportes', path: '/reportes' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 px-2">Menú Principal</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => {
          if (currentUser && !canAccessRoute(currentUser.role, item.path)) return null;
          
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center text-gray-700">
                <item.icon className="w-5 h-5 mr-3 text-primary" />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          )
        })}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center text-danger font-medium">
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </div>
        </button>
      </div>
    </div>
  );
}
