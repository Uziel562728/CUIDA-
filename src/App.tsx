import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ProviderPedidos from './pages/ProviderPedidos';
import ProviderCatalogo from './pages/ProviderCatalogo';
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
  return (
    <BrowserRouter>
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
          
          <Route path="cuidadores" element={<Cuidadores />} />
          <Route path="incidentes" element={<Incidentes />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
        
        <Route path="/proveedor" element={<ProviderLayout />}>
          <Route index element={<ProviderPedidos />} />
          <Route path="pedidos" element={<ProviderPedidos />} />
          <Route path="catalogo" element={<ProviderCatalogo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
