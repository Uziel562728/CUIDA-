import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Download, Edit2, AlertTriangle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTime12h, formatDateDDMMYYYY } from '../utils/date';
import { hasPermission } from '../lib/permissions';
import { Caregiver, Shift } from '../types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function Horas() {
  const { shifts, caregivers, caregiverRates, setCaregiverRate, correctShift, currentUser } = useStore();
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');

  const [editingRateFor, setEditingRateFor] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [correctionForm, setCorrectionForm] = useState({ date: '', startTime: '', endDate: '', endTime: '', reason: '' });
  const [errorMsg, setErrorMsg] = useState('');
  
  const [expandedCaregiver, setExpandedCaregiver] = useState<string | null>(null);

  useHardwareBack(!!editingShiftId, () => setEditingShiftId(null));
  useHardwareBack(!!errorMsg, () => setErrorMsg(''));

  const isAdmin = currentUser && hasPermission(currentUser.role, 'manage_caregivers');

  const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
  const monthEnd = new Date(selectedYear, selectedMonth, 1);
  const periodStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const calculateOverlapMinutes = (start: Date, end: Date, boundStart: Date, boundEnd: Date) => {
    const s = start > boundStart ? start : boundStart;
    const e = end < boundEnd ? end : boundEnd;
    if (s < e) {
      return (e.getTime() - s.getTime()) / 60000;
    }
    return 0;
  };

  const filteredCaregivers = selectedCaregiver ? caregivers.filter(c => c.id === selectedCaregiver) : caregivers;

  // Verify overlap inside the selected month for all shifts
  const shiftIntervals = useMemo(() => {
    const intervals: { id: string, userId: string, start: Date, end: Date }[] = [];
    shifts.forEach(s => {
      if (s.status === 'completed' && s.endDate && s.endTime) {
        const start = new Date(`${s.date}T${s.startTime}`);
        const end = new Date(`${s.endDate}T${s.endTime}`);
        if (start < end) intervals.push({ id: s.id, userId: s.userId, start, end });
      }
    });
    return intervals;
  }, [shifts]);

  const overlappingShiftIds = useMemo(() => {
    const overlaps = new Set<string>();
    for (let i = 0; i < shiftIntervals.length; i++) {
      for (let j = i + 1; j < shiftIntervals.length; j++) {
        const a = shiftIntervals[i];
        const b = shiftIntervals[j];
        if (a.userId === b.userId) {
          if (a.start < b.end && a.end > b.start) {
            overlaps.add(a.id);
            overlaps.add(b.id);
          }
        }
      }
    }
    return overlaps;
  }, [shiftIntervals]);

  const escapeCSV = (str: string) => {
    if (typeof str !== 'string') str = String(str);
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const handleExportCSV = async () => {
    const rows = [['Cuidador', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Duración (h)', 'Estado', 'Solapamiento']];
    let totalMinsGlobal = 0;
    
    filteredCaregivers.forEach(cg => {
      const cgShifts = shifts.filter(s => s.userId === cg.id);
      cgShifts.forEach(s => {
        const start = new Date(`${s.date}T${s.startTime}`);
        if (s.status === 'completed' && s.endDate && s.endTime) {
          const end = new Date(`${s.endDate}T${s.endTime}`);
          const mins = calculateOverlapMinutes(start, end, monthStart, monthEnd);
          if (mins > 0) {
            totalMinsGlobal += mins;
            const hours = (mins / 60).toFixed(2);
            rows.push([cg.name, s.date, s.startTime, s.endDate, s.endTime, hours, 'Finalizado', overlappingShiftIds.has(s.id) ? 'Sí' : 'No'].map(escapeCSV));
          }
        } else if (s.status === 'active') {
          if (start < monthEnd) {
             rows.push([cg.name, s.date, s.startTime, '', '', '0', 'Abierto', 'No'].map(escapeCSV));
          }
        }
      });
    });
    
    const globalHours = (totalMinsGlobal / 60).toFixed(2);
    rows.push([]);
    rows.push(['Total General (h)', '', '', '', '', globalHours, '', ''].map(escapeCSV));
    
    const csvContent = rows.map(e => e.join(",")).join("\r\n");
    const fileName = `reporte_horas_${periodStr}.csv`;

    try {
      if (Capacitor.isNativePlatform()) {
        const { Encoding } = await import('@capacitor/filesystem');
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: fileName,
          url: result.uri,
          dialogTitle: 'Compartir o guardar reporte CSV'
        });
      } else {
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err: any) {
      setErrorMsg('Error al exportar el archivo CSV.');
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      
      doc.setFillColor(30, 58, 95); 
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('CUIDA+', margin, 20);
      doc.setFontSize(12);
      
      const title = `Reporte de Horas y Asistencia - Período: ${periodStr}`;
      doc.text(doc.splitTextToSize(title, pageWidth - margin - 60), 60, 20);
      
      let y = 40;
      let totalMinsGlobal = 0;

      filteredCaregivers.forEach(cg => {
        const cgShifts = shifts.filter(s => s.userId === cg.id);
        let cgMins = 0;
        const rows: any[] = [];

        cgShifts.forEach(s => {
          const start = new Date(`${s.date}T${s.startTime}`);
          if (s.status === 'completed' && s.endDate && s.endTime) {
            const end = new Date(`${s.endDate}T${s.endTime}`);
            const mins = calculateOverlapMinutes(start, end, monthStart, monthEnd);
            if (mins > 0) {
              cgMins += mins;
              totalMinsGlobal += mins;
              const isOverlap = overlappingShiftIds.has(s.id);
              rows.push([
                `${formatDateDDMMYYYY(s.date)} ${formatTime12h(s.startTime)}`,
                `${formatDateDDMMYYYY(s.endDate)} ${formatTime12h(s.endTime)}`,
                `${(mins / 60).toFixed(2)}h`,
                isOverlap ? 'Solapado' : 'Finalizado'
              ]);
            }
          } else if (s.status === 'active' && start < monthEnd) {
            rows.push([
              `${formatDateDDMMYYYY(s.date)} ${formatTime12h(s.startTime)}`,
              '--',
              '--',
              'Sin finalizar'
            ]);
          }
        });

        if (rows.length > 0) {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          const caregiverTitle = `Cuidador: ${cg.name} (${cg.role}) - Total Cerrado: ${(cgMins / 60).toFixed(2)}h`;
          doc.text(caregiverTitle, margin, y);
          y += 5;

          autoTable(doc, {
            startY: y,
            head: [['Inicio', 'Fin', 'Horas', 'Estado']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 95] },
            margin: { left: margin, right: margin },
            didDrawPage: (data: any) => {
              if (data.cursor) y = data.cursor.y + 10;
            }
          });
        }
      });

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Total General Período: ${(totalMinsGlobal / 60).toFixed(2)} horas`, margin, y);

      const fileName = `reporte_horas_${periodStr}.pdf`;
      
      if (Capacitor.isNativePlatform()) {
        const base64Data = doc.output('datauristring').split(',')[1];
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: fileName,
          url: result.uri,
          dialogTitle: 'Compartir o guardar reporte PDF'
        });
      } else {
        doc.save(fileName);
      }
    } catch (err) {
      setErrorMsg('Error al generar el PDF.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {errorMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-danger mb-2">Atención</h3>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold w-full">Cerrar</button>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Horas y Asistencia</h2>
          <p className="text-gray-500">Reporte mensual</p>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            <button 
              onClick={handleExportPDF}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border shadow-sm hover:bg-gray-50 flex items-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              <span>PDF</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border shadow-sm hover:bg-gray-50 flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              <span>CSV</span>
            </button>
          </div>
        )}
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium mb-1">Mes</label>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border rounded-lg p-3 bg-gray-50 w-full"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('es-AR', {month: 'long'})}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium mb-1">Año</label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg p-3 bg-gray-50 w-full"
          >
            {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-auto md:flex-1">
          <label className="block text-sm font-medium mb-1">Cuidador</label>
          <select 
            value={selectedCaregiver} 
            onChange={e => setSelectedCaregiver(e.target.value)}
            className="border rounded-lg p-3 bg-gray-50 w-full"
          >
            <option value="">Todo el equipo</option>
            {caregivers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCaregivers.map(cg => {
          const cgShifts = shifts.filter(s => s.userId === cg.id);
          let totalMinutes = 0;
          let activeCount = 0;
          let completedCount = 0;
          let overlapCount = 0;
          
          const validShiftsForMonth: {shift: Shift, mins: number, isOverlap: boolean}[] = [];

          cgShifts.forEach(s => {
            const start = new Date(`${s.date}T${s.startTime}`);
            if (s.status === 'completed' && s.endDate && s.endTime) {
              const end = new Date(`${s.endDate}T${s.endTime}`);
              const mins = calculateOverlapMinutes(start, end, monthStart, monthEnd);
              if (mins > 0) {
                totalMinutes += mins;
                completedCount++;
                const isOverlap = overlappingShiftIds.has(s.id);
                if (isOverlap) overlapCount++;
                validShiftsForMonth.push({shift: s, mins, isOverlap});
              }
            } else if (s.status === 'active') {
              if (start < monthEnd) {
                activeCount++;
                validShiftsForMonth.push({shift: s, mins: 0, isOverlap: false});
              }
            }
          });

          validShiftsForMonth.sort((a,b) => new Date(`${b.shift.date}T${b.shift.startTime}`).getTime() - new Date(`${a.shift.date}T${a.shift.startTime}`).getTime());

          if (validShiftsForMonth.length === 0) return null;

          const totalHours = Math.floor(totalMinutes / 60);
          const remMinutes = Math.round(totalMinutes % 60);
          const decimalHours = totalMinutes / 60;

          const rateObj = caregiverRates.find(r => r.caregiverId === cg.id && r.period === periodStr);
          const rate = rateObj ? rateObj.hourlyRate : 0;
          const estimatedTotal = rate * decimalHours;

          const canViewRates = currentUser?.role === 'admin' || currentUser?.role === 'family' || currentUser?.id === cg.id;
          const canEditRates = isAdmin;
          
          const isExpanded = expandedCaregiver === cg.id;

          return (
            <div key={cg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedCaregiver(isExpanded ? null : cg.id)}
              >
                <div className="w-full md:w-auto">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      {cg.name} 
                    </h3>
                    <div className="md:hidden">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{completedCount} turnos</span>
                    {activeCount > 0 && <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">{activeCount} pendientes</span>}
                    {overlapCount > 0 && <span className="bg-danger/10 text-danger px-2 py-0.5 rounded-full font-medium flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> {overlapCount} solapados</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Horas</p>
                    <p className="text-2xl font-black text-primary">{totalHours}h {remMinutes}m</p>
                  </div>
                  <div className="hidden md:block">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                  
                  {isAdmin && (
                    <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-gray-700 uppercase">Administración de Tarifas</p>
                        {canEditRates && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingRateFor(cg.id); setTempRate(rate ? rate.toString() : ''); }}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            Configurar
                          </button>
                        )}
                      </div>
                      
                      {editingRateFor === cg.id ? (
                        <div className="flex items-center gap-3 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <label className="text-sm font-medium text-blue-900">Tarifa / hora:</label>
                          <input 
                            type="number" 
                            value={tempRate} 
                            onChange={e => setTempRate(e.target.value)} 
                            className="border rounded-lg p-2 w-24 text-sm bg-white"
                            placeholder="$"
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaregiverRate(cg.id, periodStr, Number(tempRate));
                              setEditingRateFor(null);
                            }}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
                          >
                            Guardar
                          </button>
                          <button onClick={(e) => {e.stopPropagation(); setEditingRateFor(null);}} className="text-sm text-gray-600 font-medium px-2">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-500">Valor estipulado ({periodStr}): {rate > 0 ? `$${rate}/h` : 'No configurado'}</p>
                          <p className="text-lg font-bold text-health">${estimatedTotal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <h4 className="font-bold text-gray-800 mb-3 ml-1">Detalle de Turnos</h4>
                  <div className="space-y-3">
                    {validShiftsForMonth.map(({shift, mins, isOverlap}) => {
                      const h = Math.floor(mins / 60);
                      const m = Math.round(mins % 60);
                      const hasCorrections = shift.corrections && shift.corrections.length > 0;
                      
                      return (
                        <div key={shift.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isOverlap ? 'border-danger/30' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{shift.date}</p>
                              {shift.status === 'completed' ? (
                                <p className="text-sm text-gray-600">{shift.startTime} a {shift.endTime} {shift.date !== shift.endDate ? `(${shift.endDate})` : ''}</p>
                              ) : (
                                <p className="text-sm text-warning font-medium">Iniciado a las {shift.startTime} (En curso)</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{mins > 0 ? `${h}h ${m}m` : '-'}</p>
                              {isAdmin && shift.status === 'completed' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingShiftId(shift.id);
                                    setCorrectionForm({
                                      date: shift.date,
                                      startTime: shift.startTime,
                                      endDate: shift.endDate || '',
                                      endTime: shift.endTime || '',
                                      reason: ''
                                    });
                                  }}
                                  className="text-gray-400 hover:text-primary transition-colors p-1 mt-1"
                                  title="Corregir turno"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {isOverlap && <div className="text-xs text-danger font-bold flex items-center mt-2 bg-red-50 p-2 rounded"><AlertTriangle className="w-3 h-3 mr-1"/> Solapamiento detectado</div>}
                          
                          {shift.report && (
                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <strong>Novedades:</strong> {shift.report}
                            </div>
                          )}

                          {hasCorrections && (
                            <div className="mt-3 text-xs text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                              <span className="flex items-center font-bold mb-1">
                                <Edit2 className="w-3 h-3 mr-1"/>
                                Corregido por {shift.corrections![shift.corrections!.length - 1].correctedBy}
                              </span>
                              <span className="italic">Motivo: "{shift.corrections![shift.corrections!.length - 1].reason}"</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredCaregivers.length === 0 && (
          <p className="text-center text-gray-500 py-10">No hay datos de turnos para los filtros seleccionados.</p>
        )}
      </div>

      {editingShiftId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Corregir Turno</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                  <input type="date" className="border rounded-lg p-3 bg-gray-50 w-full" value={correctionForm.date} onChange={e => setCorrectionForm({...correctionForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Inicio</label>
                  <input type="time" className="border rounded-lg p-3 bg-gray-50 w-full" value={correctionForm.startTime} onChange={e => setCorrectionForm({...correctionForm, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                  <input type="date" className="border rounded-lg p-3 bg-gray-50 w-full" value={correctionForm.endDate} onChange={e => setCorrectionForm({...correctionForm, endDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Fin</label>
                  <input type="time" className="border rounded-lg p-3 bg-gray-50 w-full" value={correctionForm.endTime} onChange={e => setCorrectionForm({...correctionForm, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo (Obligatorio)</label>
                <input required type="text" className="border rounded-lg p-3 bg-gray-50 w-full" placeholder="Ej: Olvidó fichar salida..." value={correctionForm.reason} onChange={e => setCorrectionForm({...correctionForm, reason: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setEditingShiftId(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold">Cancelar</button>
                <button 
                  onClick={() => {
                    if (correctionForm.reason.trim().length < 5) return setErrorMsg('Debe ingresar un motivo válido.');
                    correctShift(editingShiftId, correctionForm.date, correctionForm.startTime, correctionForm.endDate, correctionForm.endTime, correctionForm.reason);
                    setEditingShiftId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
