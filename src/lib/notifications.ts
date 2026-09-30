import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Reminder } from '../types';

export const scheduleReminderNotification = async (reminder: Reminder) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return;

    if (reminder.status !== 'pending') {
      await cancelReminderNotification(reminder.id);
      return;
    }

    const parts = reminder.date.split('-');
    const timeParts = reminder.time.split(':');
    let scheduleDate = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      Number(timeParts[0]),
      Number(timeParts[1])
    );

    // Cancelar la anterior si existe, para no duplicar
    await cancelReminderNotification(reminder.id);

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    // Si ya fue completado hoy, la próxima alarma debe ser mañana
    const isCompletedToday = reminder.history?.some(h => h.date === todayStr);

    if (reminder.repeat === 'daily') {
      // Ajustar base a hoy o mañana
      scheduleDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        Number(timeParts[0]),
        Number(timeParts[1])
      );
      
      // Si la hora de hoy ya pasó o ya se completó hoy, pasamos a mañana
      if (isCompletedToday || scheduleDate.getTime() <= now.getTime()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }
    } else {
      // Si no es repetitivo y ya pasó, no programar
      if (scheduleDate.getTime() < now.getTime()) return;
    }

    const numericId = hashCode(reminder.id);

    const scheduleObj: any = { at: scheduleDate };
    if (reminder.repeat === 'daily') {
      scheduleObj.every = 'day';
    } else if (reminder.repeat === 'weekly') {
      scheduleObj.every = 'week';
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Recordatorio programado',
          body: 'Tienes un evento o actividad pendiente pronto.',
          id: numericId,
          schedule: scheduleObj
        }
      ]
    });
  } catch (e) {
    console.error('Error scheduling notification', e);
  }
};

export const cancelReminderNotification = async (id: string) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const numericId = hashCode(id);
    await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
  } catch (e) {
    console.error('Error canceling notification', e);
  }
};

export const cancelAllNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (e) {
    console.error('Error canceling all notifications', e);
  }
};

// Genera un ID numérico predecible positivo
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
  }
  return Math.abs(hash);
}
