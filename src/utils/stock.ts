import { Product, Treatment } from '../types';
import { getLocalDateString } from './date';

export const calculateEstimatedConsumption = (product: Product, treatments: Treatment[]) => {
  if (product.category !== 'medication') return product.dailyConsumption || 0;
  
  const today = getLocalDateString();
  let dailyAvg = 0;
  
  treatments.forEach(t => {
    if (t.productId === product.id && t.status === 'active') {
      if (t.startDate && today < t.startDate) return;
      if (t.endDate && today > t.endDate) return;
      
      const dosesPerDay = t.schedules.length;
      const daysPerWeek = t.repeatDays.length;
      dailyAvg += (dosesPerDay * daysPerWeek * t.quantityPerDose) / 7;
    }
  });
  
  return dailyAvg;
};
