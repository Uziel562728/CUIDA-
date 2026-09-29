import { Role } from '../types';

export const ROLES_PERMISSIONS = {
  admin: ['all'],
  family: ['read_only'],
  nurse: ['read_only', 'write_care'], // can't manage users, can't buy
  doctor: ['read_only'],
  supplier: ['supplier_only'],
};

export const hasPermission = (role: Role, action: string) => {
  const perms = ROLES_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('all')) return true;
  
  if (action === 'read_all') return perms.includes('read_only') || perms.includes('write_care');
  
  if (action === 'manage_patient' || action === 'manage_caregivers' || action === 'manage_stock' || action === 'buy' || action === 'reset_data') {
    return false; // only admin
  }
  
  if (action === 'register_vitals' || action === 'register_incident' || action === 'shift' || action === 'administer_medication' || action === 'manage_reminders' || action === 'manage_documents') {
    return perms.includes('write_care');
  }
  
  return false;
};

// Simplified routing access
export const canAccessRoute = (role: Role, path: string) => {
  if (role === 'supplier') return path.startsWith('/proveedor');
  if (path.startsWith('/proveedor')) return false; // Non-suppliers can't access provider panel
  
  if (role === 'doctor' && (path === '/stock' || path === '/pedidos' || path === '/marketplace' || path === '/carrito' || path === '/configuracion')) return false;
  if (role === 'nurse' && (path === '/pedidos' || path === '/marketplace' || path === '/carrito' || path === '/configuracion')) return false;
  if (role === 'family' && (path === '/marketplace' || path === '/carrito' || path === '/configuracion')) return false;
  
  return true;
};
