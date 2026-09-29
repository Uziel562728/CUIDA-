import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LogOut, Package, ShoppingBag } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function ProviderLayout() {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();

  if (!currentUser || currentUser.role !== 'supplier') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary mr-8">CUIDA+ Proveedor</h1>
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/proveedor/pedidos" className={({isActive}) => cn("px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100")}>Pedidos</NavLink>
            <NavLink to="/proveedor/catalogo" className={({isActive}) => cn("px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100")}>Catálogo</NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden md:block">{currentUser.name}</span>
          <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-danger">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Mobile nav */}
      <div className="md:hidden bg-white border-b border-gray-200 flex">
        <NavLink to="/proveedor/pedidos" className={({isActive}) => cn("flex-1 py-3 text-center text-sm font-medium flex items-center justify-center", isActive ? "text-primary border-b-2 border-primary" : "text-gray-500")}>
          <ShoppingBag className="w-4 h-4 mr-2"/> Pedidos
        </NavLink>
        <NavLink to="/proveedor/catalogo" className={({isActive}) => cn("flex-1 py-3 text-center text-sm font-medium flex items-center justify-center", isActive ? "text-primary border-b-2 border-primary" : "text-gray-500")}>
          <Package className="w-4 h-4 mr-2"/> Catálogo
        </NavLink>
      </div>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
