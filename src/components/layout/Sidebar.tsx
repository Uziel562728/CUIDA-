import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Home, User as UserIcon, Pill, CalendarClock, Clock, Activity, Users, Calendar, AlertTriangle, Package, ShoppingCart, FileText, BarChart, Settings, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { canAccessRoute } from '../../lib/permissions';

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const { patient, currentUser } = useStore();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: UserIcon, label: 'Paciente', path: '/paciente' },
    { icon: Pill, label: 'Medicación', path: '/medicacion' },
    { icon: Clock, label: 'Timeline', path: '/timeline' },
    { icon: CalendarClock, label: 'Recordatorios', path: '/recordatorios' },
    { icon: Activity, label: 'Controles', path: '/controles' },
    { icon: Users, label: 'Cuidadores', path: '/cuidadores', adminOnly: true },
    { icon: Calendar, label: 'Turnos', path: '/turnos' },
    { icon: AlertTriangle, label: 'Incidentes', path: '/incidentes' },
    { icon: Package, label: 'Stock', path: '/stock', adminOnly: true },
    { icon: ShoppingCart, label: 'Pedidos', path: '/pedidos', adminOnly: true },
    { icon: FileText, label: 'Documentos', path: '/documentos' },
    { icon: BarChart, label: 'Reportes', path: '/reportes' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary text-white fixed h-full z-20">
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">CUIDA+</h2>
        <p className="text-primary-light text-sm">Cuidado integral</p>
      </div>
      
      <div className="px-6 pb-4 mb-4 border-b border-primary-light/30">
        <div className="text-xs text-primary-light uppercase tracking-wider mb-1">Paciente actual</div>
        <div className="font-medium text-lg leading-tight">{patient.name}</div>
        <div className="text-xs text-primary-light mt-2 flex justify-between">
          <span>{currentUser?.name.split(' ')[0]} ({currentUser?.role})</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 no-scrollbar pb-6">
        {navItems.map((item) => {
          if (currentUser && !canAccessRoute(currentUser.role, item.path)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-white/10 text-white font-medium" 
                  : "text-primary-light hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 mr-3 flex-shrink-0", "text-current")} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      {onLogout && (
        <div className="p-4 border-t border-primary-light/30">
          <button onClick={onLogout} className="flex items-center w-full px-3 py-2 text-primary-light hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Salir
          </button>
        </div>
      )}
    </aside>
  );
}
