import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User as UserIcon, Pill, Clock, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: UserIcon, label: 'Paciente', path: '/paciente' },
  { icon: Pill, label: 'Medicación', path: '/medicacion' },
  { icon: Clock, label: 'Timeline', path: '/timeline' },
  { icon: Menu, label: 'Más', path: '/mas' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
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
