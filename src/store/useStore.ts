import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, Patient, Product, Treatment, Dose, TimelineEvent, 
  Shift, Incident, VitalSign, Provider, Order, CartItem, DocumentRecord, Caregiver, Reminder
} from '../types';

import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { hasPermission } from '../lib/permissions';
import { scheduleReminderNotification, cancelReminderNotification, cancelAllNotifications } from '../lib/notifications';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationsPermissionRequested: boolean;
  setNotificationsPermissionRequested: (req: boolean) => void;

  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  resetDemoData: () => void;
  
  patient: Patient;
  updatePatient: (patient: Partial<Patient>) => void;
  
  products: Product[];
  updateProductStock: (id: string, qty: number, reason: string, user: string) => void;
  
  treatments: Treatment[];
  addTreatment: (t: Treatment) => void;
  updateTreatment: (id: string, updates: Partial<Treatment>) => void;
  
  doses: Dose[];
  generateDosesForDay: (date: string) => void;
  logDose: (id: string, status: 'taken' | 'missed', user: string, obs?: string) => boolean;
  
  timeline: TimelineEvent[];
  addTimelineEvent: (event: TimelineEvent) => void;
  
  shifts: Shift[];
  caregivers: Caregiver[];
  addCaregiver: (c: Caregiver) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  deleteCaregiver: (id: string) => void;
  startShift: (shift: Shift) => void;
  endShift: (id: string, report: string, details?: Shift['details']) => void;
  
  incidents: Incident[];
  addIncident: (incident: Incident) => void;
  updateIncidentState: (id: string, status: Incident['status'], note: string, user: string) => void;
  
  vitalSigns: VitalSign[];
  addVitalSign: (vital: VitalSign) => void;
  
  providers: Provider[];
  
  orders: Order[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (method: string, address: string) => void;
  updateOrderStatus: (id: string, status: Order['status'], user: string) => void;
  
  documents: DocumentRecord[];
  addDocument: (doc: DocumentRecord) => void;

  reminders: Reminder[];
  addReminder: (rem: Reminder) => void;
  completeReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;

  updateProviderProduct: (providerId: string, productId: string, updates: any) => void;

  quoteRequests: import('../types').QuoteRequest[];
  addQuoteRequest: (productId: string, productName: string) => void;
  respondQuoteRequest: (requestId: string, providerId: string, providerName: string, price: number, presentation: string, unitsPerPackage: number) => void;

  caregiverRates: import('../types').CaregiverRate[];
  setCaregiverRate: (caregiverId: string, period: string, hourlyRate: number) => void;
  correctShift: (shiftId: string, newDate: string, newStartTime: string, newEndDate: string, newEndTime: string, reason: string) => void;
}

import { 
  demoPatient, demoProducts, demoTreatments, demoCaregivers, 
  demoReminders, demoEvents, demoVitals, demoIncidents, 
  demoProviders, demoOrders, demoDocuments, demoShifts
} from './demoData';

const initialState = {
  patient: demoPatient,
  products: demoProducts,
  treatments: demoTreatments,
  doses: [] as Dose[],
  timeline: demoEvents,
  shifts: demoShifts,
  caregivers: demoCaregivers,
  incidents: demoIncidents,
  vitalSigns: demoVitals,
  providers: demoProviders,
  orders: demoOrders,
  cart: [] as CartItem[],
  documents: demoDocuments,
  reminders: demoReminders,
  quoteRequests: [] as import('../types').QuoteRequest[],
  caregiverRates: [] as import('../types').CaregiverRate[],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      primaryColor: '#27AE60',
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      notificationsEnabled: false,
      setNotificationsEnabled: (notificationsEnabled) => {
        set((state) => {
          if (!notificationsEnabled) state.reminders.forEach(r => cancelReminderNotification(r.id));
          else state.reminders.forEach(r => { if (r.status === 'pending') scheduleReminderNotification(r); });
          return { notificationsEnabled };
        });
      },
      notificationsPermissionRequested: false,
      setNotificationsPermissionRequested: (notificationsPermissionRequested) => set({ notificationsPermissionRequested }),
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      resetDemoData: () => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'reset_data')) throw new Error('Permisos insuficientes');
        set({ ...initialState, doses: [] });
      },

      ...initialState,

      updatePatient: (updates) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_patient')) throw new Error('Permisos insuficientes para editar paciente.');
        set((state) => ({ patient: { ...state.patient, ...updates } }));
      },

      updateProductStock: (id, qty, reason, user) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_stock')) {
          throw new Error('Permisos insuficientes para modificar el stock.');
        }
        set((state) => {
        const product = state.products.find(p => p.id === id);
        if (!product) return state;
        const diff = qty - product.currentQuantity;
        if (diff === 0) return state;

        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: getLocalDateString(),
          time: getLocalTimeString(),
          type: 'stock',
          title: 'Ajuste de inventario',
          description: `${product.name}: ${diff > 0 ? '+' : ''}${diff} ${product.unit}. Motivo: ${reason}`,
          user: user
        };

        return {
          products: state.products.map(p => p.id === id ? { ...p, currentQuantity: qty } : p),
          timeline: [event, ...state.timeline]
        };
      });
      },

      addTreatment: (t) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_patient')) throw new Error('Permisos insuficientes para gestionar tratamientos.');
        set((state) => ({ treatments: [...state.treatments, t] }));
        get().generateDosesForDay(getLocalDateString());
      },
      updateTreatment: (id, updates) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_patient')) throw new Error('Permisos insuficientes para gestionar tratamientos.');
        set((state) => {
          const newTreatments = state.treatments.map(t => t.id === id ? { ...t, ...updates } : t);
          const updatedTreatment = newTreatments.find(t => t.id === id);
          
          // Cleanup pending doses if treatment is deactivated or schedule removed
          const today = getLocalDateString();
          const newDoses = state.doses.filter(d => {
            if (d.treatmentId !== id || d.date !== today || d.status !== 'pending') return true;
            if (updatedTreatment?.status !== 'active') return false; // remove pending if inactive
            if (!updatedTreatment?.schedules.includes(d.scheduledTime)) return false; // remove pending if schedule removed
            return true;
          });

          return { treatments: newTreatments, doses: newDoses };
        });
        get().generateDosesForDay(getLocalDateString());
      },

      generateDosesForDay: (date) => set((state) => {
        // Idempotent: only generate if not already generated for this date
        const existingForDate = state.doses.filter(d => d.date === date);
        const newDoses: Dose[] = [];
        const dateObj = new Date(date + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();

        state.treatments.forEach(t => {
          if (t.status === 'active' && t.repeatDays.includes(dayOfWeek)) {
            // Check start and end dates
            if (t.startDate && date < t.startDate) return;
            if (t.endDate && date > t.endDate) return;
            
            t.schedules.forEach(time => {
              const doseId = `${t.id}-${date}-${time}`;
              if (!existingForDate.find(d => d.id === doseId) && !newDoses.find(d => d.id === doseId)) {
                newDoses.push({
                  id: doseId,
                  treatmentId: t.id,
                  date,
                  scheduledTime: time,
                  status: 'pending'
                });
              }
            });
          }
        });

        if (newDoses.length === 0) return state;
        return { doses: [...state.doses, ...newDoses] };
      }),

      logDose: (id, status, user, obs) => {
        if (!get().currentUser || (!hasPermission(get().currentUser!.role, 'administer_medication') && get().currentUser!.role !== 'admin')) {
          throw new Error('Permisos insuficientes para administrar medicación.');
        }
        let success = false;
        let errorMessage = '';
        
        if (status === 'missed' && (!obs || obs.trim() === '')) {
          throw new Error('Se requiere un motivo válido para omitir la dosis.');
        }

        set((state) => {
          const dose = state.doses.find(d => d.id === id);
          if (!dose || dose.status !== 'pending') return state; 

          const treatment = state.treatments.find(t => t.id === dose.treatmentId);
          if (!treatment) return state;

          let updatedProducts = state.products;
          let event: TimelineEvent | null = null;

          if (status === 'taken') {
            const product = state.products.find(p => p.id === treatment.productId);
            if (!product) {
              errorMessage = 'Producto no encontrado en inventario.';
              return state;
            }
            const newQty = product.currentQuantity - treatment.quantityPerDose;
            if (newQty < 0) {
              errorMessage = `Stock insuficiente de ${product.name}. Faltan ${Math.abs(newQty)} ${product.unit}.`;
              return state;
            }
            updatedProducts = state.products.map(p => p.id === product.id ? { ...p, currentQuantity: newQty } : p);

            event = {
              id: Date.now().toString() + Math.random(),
              date: getLocalDateString(),
              time: getLocalTimeString(),
              type: 'medication',
              title: 'Medicación administrada',
              description: `${treatment.medicationName} ${treatment.presentation} administrado.`,
              user: user
            };
          } else if (status === 'missed') {
            event = {
              id: Date.now().toString() + Math.random(),
              date: getLocalDateString(),
              time: getLocalTimeString(),
              type: 'medication',
              title: 'Medicación omitida',
              description: `${treatment.medicationName} no administrado. Motivo: ${obs}`,
              user: user
            };
          }

          success = true;
          return {
            doses: state.doses.map(d => d.id === id ? { ...d, status, actualTime: getLocalTimeString(), registeredBy: user, observations: obs } : d),
            products: updatedProducts,
            timeline: event ? [event, ...state.timeline] : state.timeline
          };
        });

        if (errorMessage) {
          throw new Error(errorMessage);
        }
        return success;
      },

      addTimelineEvent: (event) => set((state) => ({ timeline: [event, ...state.timeline] })),

      addCaregiver: (c) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_caregivers')) throw new Error('Permisos insuficientes');
        set((state) => ({ caregivers: [...state.caregivers, c] }));
      },
      updateCaregiver: (id, updates) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_caregivers')) throw new Error('Permisos insuficientes');
        set((state) => ({ caregivers: state.caregivers.map(c => c.id === id ? { ...c, ...updates } : c) }));
      },
      deleteCaregiver: (id) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_caregivers')) throw new Error('Permisos insuficientes');
        set((state) => ({ caregivers: state.caregivers.filter(c => c.id !== id) }));
      },

      startShift: (shift) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'shift')) throw new Error('Permisos insuficientes');
        set((state) => {
        if (state.shifts.some(s => s.userId === shift.userId && s.status === 'active')) return state;
        
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: getLocalDateString(),
          time: getLocalTimeString(),
          type: 'shift',
          title: 'Turno iniciado',
          description: `${shift.userName} inició turno.`,
          user: shift.userName
        };
        return { shifts: [...state.shifts, shift], timeline: [event, ...state.timeline] };
      });
      },

      endShift: (id, report, details) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'shift')) throw new Error('Permisos insuficientes');
        set((state) => {
        const shift = state.shifts.find(s => s.id === id);
        if (!shift || shift.status === 'completed') return state;
        
        const endDate = getLocalDateString();
        const endTime = getLocalTimeString();

        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: endDate,
          time: endTime,
          type: 'shift',
          title: 'Turno finalizado',
          description: `${shift.userName} finalizó turno. Parte: ${report.substring(0,50)}...`,
          user: shift.userName
        };
        return {
          shifts: state.shifts.map(s => s.id === id ? { ...s, status: 'completed', endDate, endTime, report, details } : s),
          timeline: [event, ...state.timeline]
        };
      });
      },

      addIncident: (incident) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'register_incident')) throw new Error('Permisos insuficientes');
        set((state) => {
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: incident.date,
          time: incident.time,
          type: 'incident',
          title: `Incidente: ${incident.type}`,
          description: incident.description,
          user: incident.registeredBy
        };
        return { incidents: [incident, ...state.incidents], timeline: [event, ...state.timeline] };
      });
      },

      updateIncidentState: (id, status, note, user) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'register_incident')) throw new Error('Permisos insuficientes');
        set((state) => {
        const incident = state.incidents.find(i => i.id === id);
        if (!incident) return state;

        const newHistoryItem = { date: getLocalDateString(), time: getLocalTimeString(), status, user, note };
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: getLocalDateString(),
          time: getLocalTimeString(),
          type: 'incident',
          title: `Seguimiento de incidente`,
          description: `Estado: ${status}. Nota: ${note}`,
          user: user
        };

        return {
          incidents: state.incidents.map(i => i.id === id ? { ...i, status, history: [...i.history, newHistoryItem] } : i),
          timeline: [event, ...state.timeline]
        };
      });
      },

      addVitalSign: (vital) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'register_vitals')) throw new Error('Permisos insuficientes');
        set((state) => {
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: vital.date,
          time: vital.time,
          type: 'control',
          title: 'Control registrado',
          description: `${vital.type}: ${vital.value} ${vital.unit}`,
          user: vital.registeredBy
        };
        return { vitalSigns: [vital, ...state.vitalSigns], timeline: [event, ...state.timeline] };
      });
      },

      addToCart: (item) => set((state) => {
        // Enforce single provider policy
        if (state.cart.length > 0 && state.cart[0].providerId !== item.providerId) {
          throw new Error('MULTIPLE_PROVIDERS');
        }
        // Group identical items
        const existingIdx = state.cart.findIndex(c => c.productId === item.productId);
        if (existingIdx >= 0) {
          const newCart = [...state.cart];
          newCart[existingIdx].quantity += item.quantity;
          return { cart: newCart };
        }
        return { cart: [...state.cart, item] };
      }),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(c => c.productId === productId ? { ...c, quantity } : c)
      })),
      removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(c => c.productId !== productId) })),
      clearCart: () => set({ cart: [] }),

      placeOrder: (method, address) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'buy')) {
          throw new Error('Permisos insuficientes para realizar compras.');
        }
        set((state) => {
        if (state.cart.length === 0) return state;
        
        const totalItems = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 2000;
        const total = totalItems + shipping;
        const provider = state.providers.find(p => p.id === state.cart[0].providerId);

        const newOrder: Order = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          date: getLocalDateString(),
          time: getLocalTimeString(),
          providerId: state.cart[0].providerId,
          providerName: provider?.name || 'Proveedor',
          items: [...state.cart],
          total,
          status: 'paid', // simulated payment
          history: [{ status: 'paid', date: getLocalDateString(), time: getLocalTimeString(), user: state.currentUser?.name || 'Sistema' }]
        };
        // Para simular que se guarda la dirección también (aunque no esté en Order type inicialmente, lo puedo añadir al history o a Order)
        (newOrder as any).deliveryAddress = address;
        (newOrder as any).patientName = state.patient.name;

        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: getLocalDateString(),
          time: getLocalTimeString(),
          type: 'order',
          title: 'Pedido realizado',
          description: `Pedido a ${newOrder.providerName} por $${total.toLocaleString('es-AR')}. Método: ${method}`,
          user: state.currentUser?.name || 'Usuario'
        };

        return { orders: [newOrder, ...state.orders], cart: [], timeline: [event, ...state.timeline] };
      });
      },

      updateOrderStatus: (id, status, user) => {
        set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!get().currentUser || (get().currentUser!.role !== 'admin' && (get().currentUser!.role !== 'supplier' || get().currentUser!.providerId !== order?.providerId))) {
          throw new Error('Permisos insuficientes para modificar el pedido.');
        }
        if (!order || order.status === status) return state;
        if (order.status === 'delivered') return state; // Terminal state

        let updatedProducts = state.products;
        let eventDesc = `Estado de pedido #${order.id} actualizado a ${status}.`;

        // Replenish stock EXACTLY ONCE when delivered
        if (status === 'delivered') {
          updatedProducts = [...state.products];
          order.items.forEach(item => {
            const prodIdx = updatedProducts.findIndex(p => p.id === item.productId);
            if (prodIdx >= 0) {
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                currentQuantity: updatedProducts[prodIdx].currentQuantity + (item.unitsPerPackage * item.quantity)
              };
            }
          });
          eventDesc = `Pedido #${order.id} entregado. Stock reabastecido.`;
        }

        const newHistoryItem = { status, date: getLocalDateString(), time: getLocalTimeString(), user };
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: getLocalDateString(),
          time: getLocalTimeString(),
          type: 'order',
          title: 'Actualización de Pedido',
          description: eventDesc,
          user: user
        };

        return {
          orders: state.orders.map(o => o.id === id ? { ...o, status, history: [...o.history, newHistoryItem] } : o),
          products: updatedProducts,
          timeline: [event, ...state.timeline]
        };
      });
      },

      addDocument: (doc) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_documents')) {
          throw new Error('Permisos insuficientes para agregar documentos.');
        }
        set((state) => {
        const event: TimelineEvent = {
          id: Date.now().toString() + Math.random(),
          date: doc.date,
          time: getLocalTimeString(),
          type: 'document',
          title: `Documento: ${doc.name}`,
          description: `${doc.category} cargado al repositorio.`,
          user: state.currentUser?.name || 'Sistema'
        };
        return { documents: [doc, ...state.documents], timeline: [event, ...state.timeline] };
      });
      },
      
      addReminder: (rem) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_reminders')) throw new Error('Permisos insuficientes');
        set((state) => {
        const newState = { reminders: [...state.reminders, rem] };
        if (get().notificationsEnabled) scheduleReminderNotification(rem);
        return newState;
      });
      },
      completeReminder: (id) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_reminders')) {
          throw new Error('Permisos insuficientes para completar recordatorios.');
        }
        set((state) => {
          let updatedReminder = null;
          const newReminders = state.reminders.map(r => {
            if (r.id === id) {
              if (r.status === 'cancelled') return r;
              const today = getLocalDateString();
              const h = r.history || [];
              if (h.some(entry => entry.date === today)) return r;
              
              updatedReminder = { 
                ...r, 
                status: r.repeat === 'once' ? 'completed' : r.status, 
                history: [...h, { date: today, time: getLocalTimeString(), user: state.currentUser?.name || 'Sistema' }]
              };
              return updatedReminder;
            }
            return r;
          });
          
          if (updatedReminder && get().notificationsEnabled) {
            cancelReminderNotification(id).then(() => {
              if (updatedReminder.status !== 'completed') {
                scheduleReminderNotification(updatedReminder);
              }
            }).catch(console.error);
          }
          
          return { reminders: newReminders as any };
        });
      },
      deleteReminder: (id) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_reminders')) throw new Error('Permisos insuficientes');
        set((state) => {
        if (get().notificationsEnabled) cancelReminderNotification(id);
        return { reminders: state.reminders.filter(r => r.id !== id) };
      });
      },
      updateReminder: (id, updates) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_reminders')) throw new Error('Permisos insuficientes');
        set((state) => {
        const newRem = state.reminders.find(r => r.id === id);
        if (newRem && get().notificationsEnabled) scheduleReminderNotification({ ...newRem, ...updates });
        return { reminders: state.reminders.map(r => r.id === id ? { ...r, ...updates } : r) };
      });
      },

      updateProviderProduct: (providerId, productId, updates) => {
        if (!get().currentUser || (get().currentUser!.role !== 'admin' && (get().currentUser!.role !== 'supplier' || get().currentUser!.providerId !== providerId))) {
          throw new Error('Permisos insuficientes para modificar el catálogo.');
        }
        set((state) => ({
          providers: state.providers.map(prov => prov.id === providerId ? {
            ...prov,
            products: prov.products.map(prod => prod.productId === productId ? { ...prod, ...updates } : prod)
          } : prov)
        }));
      },

      addQuoteRequest: (productId, productName) => {
        set(state => {
          if (state.quoteRequests.find(q => q.productId === productId && q.status === 'pending')) return state;
          const req: import('../types').QuoteRequest = {
            id: Date.now().toString(),
            productId,
            productName,
            date: getLocalDateString(),
            status: 'pending',
            responses: []
          };
          return { quoteRequests: [req, ...state.quoteRequests] };
        });
      },

      respondQuoteRequest: (requestId, providerId, providerName, price, presentation, unitsPerPackage) => {
        set(state => {
          const req = state.quoteRequests.find(r => r.id === requestId);
          if (!req) return state;

          const newRequests = state.quoteRequests.map(r => {
            if (r.id === requestId) {
              const hasResponded = r.responses.some(resp => resp.providerId === providerId);
              if (hasResponded) return r;
              return {
                ...r,
                status: 'answered' as const,
                responses: [...r.responses, { providerId, providerName, price, presentation, unitsPerPackage, date: getLocalDateString() }]
              };
            }
            return r;
          });

          // Also add to provider's catalog so it appears in the marketplace
          const newProviders = state.providers.map(p => {
            if (p.id === providerId) {
              const existingIdx = p.products.findIndex(prod => prod.productId === req.productId);
              if (existingIdx >= 0) {
                const newProds = [...p.products];
                newProds[existingIdx] = { ...newProds[existingIdx], price, presentation, unitsPerPackage, stock: 'available' as const };
                return { ...p, products: newProds };
              } else {
                return { 
                  ...p, 
                  products: [...p.products, { productId: req.productId, name: req.productName, presentation, unitsPerPackage, price, stock: 'available' as const, delivery: 'Por confirmar' }] 
                };
              }
            }
            return p;
          });

          return { quoteRequests: newRequests, providers: newProviders };
        });
      },

      setCaregiverRate: (caregiverId, period, hourlyRate) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_caregivers')) throw new Error('Permisos insuficientes');
        set(state => {
          const rates = [...state.caregiverRates];
          const idx = rates.findIndex(r => r.caregiverId === caregiverId && r.period === period);
          if (idx >= 0) {
            rates[idx] = { ...rates[idx], hourlyRate };
          } else {
            rates.push({ caregiverId, period, hourlyRate });
          }
          return { caregiverRates: rates };
        });
      },

      correctShift: (shiftId, newDate, newStartTime, newEndDate, newEndTime, reason) => {
        if (!get().currentUser || !hasPermission(get().currentUser!.role, 'manage_caregivers')) throw new Error('Permisos insuficientes');
        set(state => {
          const shift = state.shifts.find(s => s.id === shiftId);
          if (!shift) return state;

          const correction = {
            originalDate: shift.date,
            originalStartTime: shift.startTime,
            originalEndDate: shift.endDate,
            originalEndTime: shift.endTime,
            reason,
            correctedBy: state.currentUser!.name,
            correctedAt: getLocalDateString() + ' ' + getLocalTimeString()
          };

          const event: TimelineEvent = {
            id: Date.now().toString(),
            date: getLocalDateString(),
            time: getLocalTimeString(),
            type: 'shift',
            title: 'Turno corregido',
            description: `Turno de ${shift.userName} corregido. Motivo: ${reason}`,
            user: state.currentUser!.name
          };

          return {
            shifts: state.shifts.map(s => s.id === shiftId ? {
              ...s,
              date: newDate,
              startTime: newStartTime,
              endDate: newEndDate,
              endTime: newEndTime,
              corrections: [...(s.corrections || []), correction]
            } : s),
            timeline: [event, ...state.timeline]
          };
        });
      }

    }),
    {
      name: 'cuida-plus-storage', // unique name
      version: 3, // versioning bumped
      migrate: (persistedState: any, version: number) => {
        let state = { ...persistedState };
        if (version === 1) {
          state = { ...initialState, ...state };
        }
        if (version < 3) {
          if (state.primaryColor === '#1E3A5F') {
            state.primaryColor = '#27AE60';
          }
        }
        return state as any;
      }
    }
  )
);
