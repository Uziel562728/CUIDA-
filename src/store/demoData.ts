import { getLocalDateString } from '../utils/date';
import { Patient, Product, Treatment, TimelineEvent, Shift, Caregiver, Incident, VitalSign, Provider, Order, DocumentRecord, Reminder } from '../types';

const t = getLocalDateString();
const d = (daysAgo: number) => {
  const parts = t.split('-');
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  dateObj.setDate(dateObj.getDate() - daysAgo);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
};

export const demoPatient: Patient = {
  id: 'p1',
  name: 'Marta Pérez',
  age: 78,
  birthDate: '1948-05-12',
  address: 'Av. Siempre Viva 742',
  mainContact: 'Juan Pérez (Hijo)',
  mainContactPhone: '11-4567-8910',
  emergencyContact: 'Ana Pérez',
  emergencyContactPhone: '11-1234-5678',
  healthInsurance: 'OSDE 210',
  bloodType: 'O+',
  diagnoses: ['Hipertensión Arterial', 'Diabetes Tipo 2', 'Artrosis leve'],
  allergies: ['Penicilina', 'Ibuprofeno'],
  doctor: 'Dr. Roberto García',
  observations: 'Paciente con movilidad reducida, usar bastón. Dieta hiposódica estricta.'
};

export const demoProducts: Product[] = [
  { id: 'pr1', name: 'Pañales Adulto G', unit: 'u', currentQuantity: 45, minStock: 20, dailyConsumption: 3, category: 'diapers' },
  { id: 'pr2', name: 'Apósitos', unit: 'u', currentQuantity: 15, minStock: 10, dailyConsumption: 0, category: 'other' },
  { id: 'pr3', name: 'Gasas estériles', unit: 'sobres', currentQuantity: 10, minStock: 15, dailyConsumption: 0, category: 'other' },
  { id: 'pr4', name: 'Guantes de látex', unit: 'cajas', currentQuantity: 2, minStock: 1, dailyConsumption: 0.1, category: 'other' },
  { id: 'pr5', name: 'Alcohol al 70%', unit: 'botellas', currentQuantity: 1, minStock: 2, dailyConsumption: 0, category: 'other' },
  { id: 'pr6', name: 'Losartán 50mg', unit: 'comp', currentQuantity: 12, minStock: 15, dailyConsumption: 1, category: 'medication' },
  { id: 'pr7', name: 'Metformina 850mg', unit: 'comp', currentQuantity: 50, minStock: 30, dailyConsumption: 2, category: 'medication' },
  { id: 'pr8', name: 'Amlodipina 5mg', unit: 'comp', currentQuantity: 20, minStock: 10, dailyConsumption: 1, category: 'medication' },
  { id: 'pr9', name: 'Atorvastatina 20mg', unit: 'comp', currentQuantity: 25, minStock: 15, dailyConsumption: 1, category: 'medication' },
  { id: 'pr10', name: 'Paracetamol 500mg', unit: 'comp', currentQuantity: 10, minStock: 10, dailyConsumption: 0, category: 'medication' }
];

export const demoTreatments: Treatment[] = [
  { id: 't1', patientId: 'p1', productId: 'pr6', medicationName: 'Losartán', presentation: '50mg', quantityPerDose: 1, unit: 'comp', frequency: 'Cada 24h', schedules: ['08:00'], repeatDays: [0,1,2,3,4,5,6], startDate: d(30), professional: 'Dr. Roberto García', status: 'active', indications: '' },
  { id: 't2', patientId: 'p1', productId: 'pr7', medicationName: 'Metformina', presentation: '850mg', quantityPerDose: 1, unit: 'comp', frequency: 'Cada 12h', schedules: ['08:00', '20:00'], repeatDays: [0,1,2,3,4,5,6], startDate: d(30), professional: 'Dr. Roberto García', status: 'active', indications: '' },
  { id: 't3', patientId: 'p1', productId: 'pr8', medicationName: 'Amlodipina', presentation: '5mg', quantityPerDose: 1, unit: 'comp', frequency: 'Cada 24h', schedules: ['14:00'], repeatDays: [0,1,2,3,4,5,6], startDate: d(15), professional: 'Dr. Roberto García', status: 'active', indications: '' },
  { id: 't4', patientId: 'p1', productId: 'pr9', medicationName: 'Atorvastatina', presentation: '20mg', quantityPerDose: 1, unit: 'comp', frequency: 'Cada 24h', schedules: ['21:00'], repeatDays: [0,1,2,3,4,5,6], startDate: d(10), professional: 'Dr. Roberto García', status: 'active', indications: '' }
];

export const demoCaregivers: Caregiver[] = [
  { id: 'c1', name: 'María González', role: 'Enfermera Jefa', phone: '11-1111-2222', schedule: '08:00 - 20:00', days: 'Lun a Vie' },
  { id: 'c2', name: 'Laura Rodríguez', role: 'Cuidadora', phone: '11-3333-4444', schedule: '20:00 - 08:00', days: 'Lun a Vie' },
  { id: 'c3', name: 'Pedro Sánchez', role: 'Enfermero', phone: '11-5555-6666', schedule: 'Fines de semana', days: 'Sáb, Dom' },
  { id: 'c4', name: 'Juan Pérez', role: 'Familiar Principal', phone: '11-4567-8910', schedule: 'Visitas', days: 'Variable' },
  { id: 'c5', name: 'Ana Pérez', role: 'Familiar', phone: '11-1234-5678', schedule: 'Soporte', days: 'Variable' },
  { id: 'c6', name: 'Carlos Pérez', role: 'Familiar', phone: '11-9876-5432', schedule: 'Soporte', days: 'Variable' }
];

export const demoReminders: Reminder[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `rem${i}`, title: `Recordatorio ${i+1} ${['Turno médico', 'Revisar stock', 'Llamar familiar', 'Pagar prepaga', 'Revisar receta'][i%5]}`, type: ['medical', 'medication', 'general', 'medical', 'general'][i%5] as any, date: i < 5 ? t : d(i-2), time: `1${i%10}:00`, repeat: i%2===0 ? 'daily' : 'once', status: i < 3 ? 'completed' : 'pending'
}));

export const demoEvents: TimelineEvent[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `ev${i}`, date: d(Math.floor(i/3)), time: `0${9+(i%8)}:00`, type: ['note', 'control', 'shift', 'medication', 'incident', 'document'][i%6] as any, title: `Evento ${i+1}`, description: `Descripción simulada del evento ${i+1} en el historial cronológico para probar los listados largos y paginación si fuese necesario.`, user: 'María González'
}));

export const demoVitals: VitalSign[] = [
  { id: 'v1', date: d(0), time: '08:15', type: 'pressure', value: '130/85', unit: 'mmHg', registeredBy: 'María González' },
  { id: 'v2', date: d(0), time: '08:20', type: 'glucose', value: '110', unit: 'mg/dL', registeredBy: 'María González' },
  { id: 'v3', date: d(1), time: '08:10', type: 'pressure', value: '120/80', unit: 'mmHg', registeredBy: 'María González' },
  { id: 'v4', date: d(1), time: '20:10', type: 'pressure', value: '125/82', unit: 'mmHg', registeredBy: 'Laura Rodríguez' },
  { id: 'v5', date: d(2), time: '08:15', type: 'pressure', value: '140/90', unit: 'mmHg', registeredBy: 'María González' },
];

export const demoIncidents: Incident[] = [
  { id: 'i1', date: d(0), time: '09:00', type: 'Caída', description: 'Paciente tropezó en el baño.', actions: 'Se asiste a levantarse, control de signos, sin lesiones aparentes.', status: 'following', history: [{date: d(0), time: '09:00', status: 'reported', user: 'María González', note: 'Caída leve'}], registeredBy: 'María González' },
  { id: 'i2', date: d(2), time: '14:30', type: 'Mareo/Desmayo', description: 'Mareo al levantarse rápido de la silla.', actions: 'Reposar 15 mins. Control PA.', status: 'resolved', history: [{date: d(2), time: '14:30', status: 'reported', user: 'Laura Rodríguez', note: ''}, {date: d(2), time: '15:00', status: 'resolved', user: 'Laura Rodríguez', note: 'Se recuperó favorablemente'}], registeredBy: 'Laura Rodríguez' },
  { id: 'i3', date: d(5), time: '21:00', type: 'Error en medicación', description: 'Se omitió tomar Metformina con la cena.', actions: 'Aviso al médico, se salta dosis.', status: 'resolved', history: [{date: d(5), time: '21:00', status: 'reported', user: 'Laura Rodríguez', note: ''}], registeredBy: 'Laura Rodríguez' },
  { id: 'i4', date: d(10), time: '10:00', type: 'Otro', description: 'Irritación en piel por pañal.', actions: 'Aplicar crema con vit A.', status: 'resolved', history: [{date: d(10), time: '10:00', status: 'reported', user: 'María González', note: ''}], registeredBy: 'María González' },
];

export const demoProviders: Provider[] = [
  { id: 'prov1', name: 'Farmacia Central', email: 'ventas@farmaciacentral.com', products: [
    { productId: 'pr6', name: 'Losartán 50mg', presentation: 'Caja x30', unitsPerPackage: 30, price: 12500, stock: 'available', delivery: 'Hoy' },
    { productId: 'pr7', name: 'Metformina 850mg', presentation: 'Caja x60', unitsPerPackage: 60, price: 18000, stock: 'available', delivery: 'Hoy' },
    { productId: 'pr1', name: 'Pañales Adulto G', presentation: 'Bolsa x16', unitsPerPackage: 16, price: 14000, stock: 'available', delivery: 'Hoy' }
  ]},
  { id: 'prov2', name: 'Farmacia Norte', email: 'ventas@farmacianorte.com', products: [
    { productId: 'pr8', name: 'Amlodipina 5mg', presentation: 'Caja x30', unitsPerPackage: 30, price: 10000, stock: 'available', delivery: 'Mañana' },
    { productId: 'pr9', name: 'Atorvastatina 20mg', presentation: 'Caja x30', unitsPerPackage: 30, price: 15500, stock: 'available', delivery: 'Mañana' }
  ]},
  { id: 'prov3', name: 'Insumos Médicos Sur', email: 'ventas@insumossur.com', products: [
    { productId: 'pr2', name: 'Apósitos', presentation: 'Caja x10', unitsPerPackage: 10, price: 5000, stock: 'available', delivery: '2-3 días' },
    { productId: 'pr3', name: 'Gasas estériles', presentation: 'Caja x100 sobres', unitsPerPackage: 100, price: 8000, stock: 'available', delivery: '2-3 días' },
    { productId: 'pr4', name: 'Guantes de látex', presentation: 'Caja x100', unitsPerPackage: 100, price: 9500, stock: 'available', delivery: '2-3 días' }
  ]},
  { id: 'prov4', name: 'Farma Express', email: 'ventas@farmaexpress.com', products: [
    { productId: 'pr10', name: 'Paracetamol 500mg', presentation: 'Caja x20', unitsPerPackage: 20, price: 3500, stock: 'available', delivery: 'Hoy' }
  ]},
  { id: 'prov5', name: 'Distribuidora Higiene', email: 'ventas@higiene.com', products: [
    { productId: 'pr5', name: 'Alcohol al 70%', presentation: 'Botella 500ml', unitsPerPackage: 1, price: 2000, stock: 'available', delivery: 'Mañana' }
  ]}
];

export const demoOrders: Order[] = [
  { id: 'ORD-1001', date: d(1), time: '10:00', providerId: 'prov1', providerName: 'Farmacia Central', items: [{productId: 'pr6', name: 'Losartán 50mg', quantity: 2, price: 12500, unitsPerPackage: 30, providerId: 'prov1'}], total: 27000, status: 'paid', history: [] },
  { id: 'ORD-1002', date: d(3), time: '11:00', providerId: 'prov2', providerName: 'Farmacia Norte', items: [{productId: 'pr8', name: 'Amlodipina 5mg', quantity: 1, price: 10000, unitsPerPackage: 30, providerId: 'prov2'}], total: 12000, status: 'preparing', history: [] },
  { id: 'ORD-1003', date: d(4), time: '09:00', providerId: 'prov3', providerName: 'Insumos Médicos Sur', items: [{productId: 'pr4', name: 'Guantes de látex', quantity: 1, price: 9500, unitsPerPackage: 100, providerId: 'prov3'}], total: 11500, status: 'shipping', history: [] },
  { id: 'ORD-1004', date: d(7), time: '15:00', providerId: 'prov1', providerName: 'Farmacia Central', items: [{productId: 'pr1', name: 'Pañales Adulto G', quantity: 3, price: 14000, unitsPerPackage: 16, providerId: 'prov1'}], total: 44000, status: 'delivered', history: [] }
];

export const demoDocuments: DocumentRecord[] = [
  { id: 'doc1', date: d(30), name: 'Receta Losartán', category: 'Receta', professional: 'Dr. Roberto García', description: 'Receta crónica' },
  { id: 'doc2', date: d(30), name: 'Receta Metformina', category: 'Receta', professional: 'Dr. Roberto García', description: 'Receta crónica' },
  { id: 'doc3', date: d(15), name: 'Receta Amlodipina', category: 'Receta', professional: 'Dr. Roberto García', description: '' },
  { id: 'doc4', date: d(10), name: 'Receta Atorvastatina', category: 'Receta', professional: 'Dr. Roberto García', description: '' },
  { id: 'doc5', date: d(45), name: 'Laboratorio Sangre', category: 'Análisis', professional: 'Dr. Roberto García', description: 'Glucemia alta' },
  { id: 'doc6', date: d(60), name: 'Electrocardiograma', category: 'Estudio', professional: 'Dr. Martínez', description: 'Ritmo sinusal regular' },
  { id: 'doc7', date: d(90), name: 'Ecocardiograma', category: 'Estudio', professional: 'Dr. Martínez', description: 'Sin hallazgos' },
  { id: 'doc8', date: d(5), name: 'Certificado Médico', category: 'Informe médico', professional: 'Dr. Roberto García', description: 'Certificado de discapacidad' }
];
