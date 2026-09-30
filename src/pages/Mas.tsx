import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CalendarClock, Activity, Users, Calendar, AlertTriangle, Package, ShoppingCart, FileText, BarChart, Settings, LogOut, Clock, Pill, User } from 'lucide-react';
import { canAccessRoute } from '../lib/permissions';
import { isSponsorsEnabled } from '../config/sponsors';
import { SponsorsList } from '../components/SponsorLogos';

export default function Mas() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  if (!currentUser) return null;

  const categories = [
    {
      title: 'Paciente y Equipo',
      items: [
        { icon: User, label: 'Paciente', path: '/paciente' },
        { icon: Users, label: 'Cuidadores', path: '/cuidadores' },
        { icon: Calendar, label: 'Turnos', path: '/turnos' },
      ]
    },
    {
      title: 'Historial y Documentos',
      items: [
        { icon: CalendarClock, label: 'Recordatorios', path: '/recordatorios' },
        { icon: Activity, label: 'Controles', path: '/controles' },
        { icon: AlertTriangle, label: 'Incidentes', path: '/incidentes' },
        { icon: FileText, label: 'Documentos', path: '/documentos' },
      ]
    },
    {
      title: 'Insumos y Pedidos',
      items: [
        { icon: Package, label: 'Stock', path: '/stock' },
        { icon: ShoppingCart, label: 'Pedidos', path: '/pedidos' },
      ]
    },
    {
      title: 'Reportes y Horas',
      items: [
        { icon: Clock, label: 'Horas y Asistencia', path: '/horas' },
        { icon: BarChart, label: 'Reportes', path: '/reportes' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Settings, label: 'Configuración', path: '/configuracion' },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10">
      <h2 className="text-2xl font-bold text-gray-900 px-2">Más Opciones</h2>
      
      {categories.map((cat, idx) => {
        const visibleItems = cat.items.filter(item => canAccessRoute(currentUser.role, item.path));
        if (visibleItems.length === 0) return null;
        
        return (
          <div key={idx} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">{cat.title}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {visibleItems.map((item, i) => (
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
              ))}
            </div>
          </div>
        );
      })}

      {isSponsorsEnabled && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">Aliados</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-4">
            {SponsorsList.map(Sponsor => (
              <div key={Sponsor.id} className="flex items-center justify-center p-2 h-16">
                <Sponsor.Component className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
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
