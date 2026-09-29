import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut } from 'lucide-react';

export default function ProviderMas() {
  const navigate = useNavigate();
  const { setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 px-2">Más Opciones</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
