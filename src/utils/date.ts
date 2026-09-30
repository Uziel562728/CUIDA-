export const getLocalDateString = () => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLocalTimeString = () => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatTime12h = (time: string | undefined | null): string => {
  if (!time) return '--:--';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const hour = parseInt(parts[0], 10);
  const min = parts[1];
  if (isNaN(hour)) return time;
  
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${ampm}`;
};

export const formatDateDDMMYYYY = (date: string | undefined | null): string => {
  if (!date) return '--/--/----';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
