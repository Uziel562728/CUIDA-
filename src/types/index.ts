export type Role = 'admin' | 'family' | 'nurse' | 'doctor' | 'supplier';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  providerId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number; // calculated in UI
  birthDate: string; // YYYY-MM-DD
  address: string;
  mainContact: string;
  mainContactPhone: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  doctor: string;
  healthInsurance: string;
  bloodType: string;
  allergies: string[];
  diagnoses: string[];
  observations: string;
}

export interface Product {
  id: string;
  name: string; // Ej: Losartán 50mg x30
  category: 'diapers' | 'gauze' | 'gloves' | 'dressings' | 'probes' | 'syringes' | 'masks' | 'alcohol' | 'saline' | 'nutrition' | 'medication' | 'other';
  currentQuantity: number; // Single source of truth for stock
  unit: string; // "comprimidos", "unidades"
  dailyConsumption: number; // Consumo promedio calculado o estático
  minStock: number;
}

export interface Treatment {
  id: string;
  patientId: string;
  productId: string; // Link to inventory
  medicationName: string;
  presentation: string;
  quantityPerDose: number;
  unit: string;
  frequency: string;
  schedules: string[]; // ['08:00', '20:00']
  repeatDays: number[]; // 0=Sun, 1=Mon... [0,1,2,3,4,5,6] for daily
  startDate: string;
  endDate?: string;
  indications: string;
  professional: string;
  status: 'active' | 'inactive';
}

export interface Dose {
  id: string; // e.g., treatmentId-date-time
  treatmentId: string;
  date: string; // YYYY-MM-DD (local)
  scheduledTime: string; // HH:mm
  actualTime?: string;
  status: 'pending' | 'taken' | 'missed';
  registeredBy?: string;
  observations?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'medication' | 'control' | 'shift' | 'incident' | 'document' | 'order' | 'note' | 'stock';
  title: string;
  description: string;
  user: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  role: string;
  date: string; // startDate
  startTime: string;
  endDate?: string;
  endTime?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  report?: string; // Observaciones generales
  details?: {
    alimentacion: string;
    higiene: string;
    movilidad: string;
    sueno: string;
    insumos: string;
  };
}

export interface Incident {
  id: string;
  date: string;
  time: string;
  type: string;
  description: string;
  registeredBy: string;
  actions: string;
  status: 'reported' | 'following' | 'resolved' | 'attention';
  history: { date: string; time: string; status: string; user: string; note?: string }[];
}

export interface VitalSign {
  id: string;
  date: string;
  time: string;
  type: 'pressure' | 'temperature' | 'glucose' | 'heartRate' | 'saturation' | 'weight' | 'respiratoryRate';
  value: string;
  unit: string;
  registeredBy: string;
}

export interface ProviderProduct {
  productId: string; 
  name: string;
  presentation: string;
  unitsPerPackage: number;
  price: number; 
  stock: 'available' | 'out_of_stock'; 
  delivery: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  products: ProviderProduct[];
}

export interface CartItem {
  productId: string;
  name: string;
  unitsPerPackage: number;
  quantity: number; // Cantidad de paquetes
  price: number;
  providerId: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  providerId: string;
  providerName: string;
  items: CartItem[];
  total: number;
  status: 'placed' | 'paid' | 'accepted' | 'preparing' | 'shipping' | 'delivered';
  history: { status: string; date: string; time: string; user: string }[];
}

export interface Caregiver {
  id: string;
  name: string;
  role: string;
  phone: string;
  schedule: string;
  days: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  date: string;
  category: string;
  professional: string;
  description: string;
  fileUrl?: string;
  mimeType?: string;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'medication' | 'control' | 'shift' | 'general';
  date: string;
  time: string;
  repeat: 'once' | 'daily' | 'weekly' | 'custom';
  status: 'pending' | 'completed' | 'cancelled';
  history?: { date: string; time: string; user: string }[];
}
