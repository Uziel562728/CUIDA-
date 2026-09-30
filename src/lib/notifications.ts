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

    // Calcular Date
    const parts = reminder.date.split('-');
    const timeParts = reminder.time.split(':');
    const scheduleDate = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      Number(timeParts[0]),
      Number(timeParts[1])
    );

    // Cancelar la anterior si existe, para no duplicar (usamos hash del ID para numérico)
    await cancelReminderNotification(reminder.id);

    // Si ya pasó, no programar
    if (scheduleDate.getTime() < Date.now()) return;

    // Numeric ID (LocalNotifications requiere numérico)
    const numericId = hashCode(reminder.id);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Recordatorio programado',
          body: 'Tienes un evento o actividad pendiente pronto.',
          id: numericId,
          schedule: { at: scheduleDate },
          smallIcon: 'ic_stat_icon_config_sample' // Default
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
      hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
