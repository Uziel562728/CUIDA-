import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LogOut, Package, ShoppingBag, FileText, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function ProviderLayout() {
  const { currentUser, setCurrentUser, quoteRequests } = useStore();
  const navigate = useNavigate();

  if (!currentUser || currentUser.role !== 'supplier') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const pendingQuotes = quoteRequests.filter(q => q.status === 'pending' || (q.status === 'answered' && !q.responses.some(r => r.providerId === currentUser.providerId))).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary mr-8">CUIDA+ Proveedor</h1>
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/proveedor/pedidos" className={({isActive}) => cn("px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100")}>Pedidos</NavLink>
            <NavLink to="/proveedor/catalogo" className={({isActive}) => cn("px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100")}>Catálogo</NavLink>
            <NavLink to="/proveedor/cotizaciones" className={({isActive}) => cn("px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center", isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100")}>
              Cotizaciones
              {pendingQuotes > 0 && <span className="ml-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingQuotes}</span>}
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden md:block">{currentUser.name}</span>
          <button onClick={handleLogout} className="hidden md:flex items-center text-gray-500 hover:text-danger">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Mobile nav (Bottom Nav for Provider) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <NavLink to="/proveedor/pedidos" className={({isActive}) => cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
            <ShoppingBag className="w-6 h-6"/>
            <span className="text-[10px] font-medium">Pedidos</span>
          </NavLink>
          <NavLink to="/proveedor/catalogo" className={({isActive}) => cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
            <Package className="w-6 h-6"/>
            <span className="text-[10px] font-medium">Catálogo</span>
          </NavLink>
          <NavLink to="/proveedor/cotizaciones" className={({isActive}) => cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative", isActive ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
            <div className="relative">
              <FileText className="w-6 h-6"/>
              {pendingQuotes > 0 && <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">{pendingQuotes}</span>}
            </div>
            <span className="text-[10px] font-medium">Cotizaciones</span>
          </NavLink>
          <NavLink to="/proveedor/mas" className={({isActive}) => cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive ? "text-primary" : "text-gray-400 hover:text-gray-600")}>
            <Menu className="w-6 h-6"/>
            <span className="text-[10px] font-medium">Más</span>
          </NavLink>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
