import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Home, Pill, Clock, Menu, Package, FileText, CalendarClock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BottomNav() {
  const { currentUser } = useStore();
  
  if (!currentUser) return null;

  let navItems = [];
  
  switch (currentUser.role) {
    case 'admin':
      navItems = [
        { icon: Home, label: 'Hoy', path: '/' },
        { icon: Pill, label: 'Cuidados', path: '/medicacion' },
        { icon: Package, label: 'Insumos', path: '/stock' },
        { icon: Menu, label: 'Más', path: '/mas' },
      ];
      break;
    case 'family':
      navItems = [
        { icon: Home, label: 'Hoy', path: '/' },
        { icon: Pill, label: 'Cuidados', path: '/medicacion' },
        { icon: Clock, label: 'Historial', path: '/timeline' },
        { icon: Menu, label: 'Más', path: '/mas' },
      ];
      break;
    case 'nurse':
      navItems = [
        { icon: Home, label: 'Hoy', path: '/' },
        { icon: Clock, label: 'Registrar', path: '/timeline' },
        { icon: CalendarClock, label: 'Mi turno', path: '/turnos' },
        { icon: Menu, label: 'Más', path: '/mas' },
      ];
      break;
    case 'doctor':
      navItems = [
        { icon: Home, label: 'Resumen', path: '/' },
        { icon: Clock, label: 'Historial', path: '/timeline' },
        { icon: FileText, label: 'Documentos', path: '/documentos' },
        { icon: Menu, label: 'Más', path: '/mas' },
      ];
      break;
    default:
      navItems = [
        { icon: Home, label: 'Hoy', path: '/' },
        { icon: Menu, label: 'Más', path: '/mas' },
      ];
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
