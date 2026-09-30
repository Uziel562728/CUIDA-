import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString, formatTime12h, formatDateDDMMYYYY } from '../utils/date';
import { FileDown, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function Reports() {
  const { patient, treatments, timeline, vitalSigns, documents, doses, incidents, shifts } = useStore();
  
  const [selected, setSelected] = useState({
    personal: true,
    medication: true,
    tomas: true,
    vitals: true,
    incidentes: true,
    turnos: true,
    documents: true,
    timeline: true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggle = (key: keyof typeof selected) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = () => {
    setIsGenerating(true);
    setErrorMsg('');
    setTimeout(async () => {
      try {
        const doc = new jsPDF();
        const autoTable = (await import('jspdf-autotable')).default;
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        
        // Header
        doc.setFillColor(30, 58, 95);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text('CUIDA+', margin, 25);
        doc.setFontSize(12);
        doc.text('Reporte Clínico', pageWidth - margin - 40, 25);
        
        let y = 50;
        doc.setTextColor(0, 0, 0);

        const addSectionTitle = (title: string) => {
          if (y > pageHeight - 40) { doc.addPage(); y = 20; }
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 58, 95);
          doc.text(title, margin, y);
          y += 8;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y - 5, pageWidth - margin, y - 5);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
        };

        if (selected.personal) {
          addSectionTitle('Datos Personales y Médicos');
          doc.setFontSize(10);
          const personalData = [
            ['Paciente', `${patient.name} (${patient.age} años)`],
            ['Contacto', `${patient.mainContact} (${patient.mainContactPhone})`],
            ['Obra Social', patient.healthInsurance],
            ['Alergias', patient.allergies.join(', ') || 'Ninguna'],
            ['Diagnósticos', patient.diagnoses.join(', ')],
            ['Observaciones', patient.observations]
          ];
          
          autoTable(doc, {
            startY: y,
            body: personalData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
            margin: { left: margin, right: margin },
            didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
          });
          y += 5;
        }

        if (selected.medication) {
          addSectionTitle('Tratamientos Activos');
          const activeT = treatments.filter(t => t.status === 'active');
          if (activeT.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin tratamientos activos.', margin, y);
            y += 8;
          } else {
            const tableData = activeT.map(t => [
              t.medicationName,
              t.presentation,
              `${t.quantityPerDose} ${t.unit}`,
              t.frequency,
              t.schedules.map(formatTime12h).join(', ')
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Medicamento', 'Presentación', 'Dosis', 'Frecuencia', 'Horarios']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }
        
        const todayStr = getLocalDateString();
        const parts = todayStr.split('-');
        const todayDateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const sixDaysAgo = new Date(todayDateObj);
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
        const limitStr = `${sixDaysAgo.getFullYear()}-${String(sixDaysAgo.getMonth()+1).padStart(2,'0')}-${String(sixDaysAgo.getDate()).padStart(2,'0')}`;
        
        if (selected.tomas) {
          addSectionTitle('Tomas de Medicación (Últimos 7 días)');
          const recentDoses = doses.filter(d => d.date >= limitStr && d.date <= todayStr && d.status !== 'pending').sort((a,b) => (b.date + (b.actualTime || '')).localeCompare(a.date + (a.actualTime || '')));
          if (recentDoses.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin tomas registradas.', margin, y);
            y += 8;
          } else {
            const tableData = recentDoses.map(d => {
              const t = treatments.find(tr => tr.id === d.treatmentId);
              return ([
                formatDateDDMMYYYY(d.date),
                formatTime12h(d.actualTime || d.scheduledTime),
                t ? t.medicationName : 'Desconocido',
                d.status === 'taken' ? 'Tomado' : 'Omitido',
                d.registeredBy,
                d.status === 'missed' ? (d.observations || '') : ''
              ] as string[]);
            });
            autoTable(doc, {
              startY: y,
              head: [['Fecha', 'Hora', 'Medicamento', 'Estado', 'Por', 'Motivo']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }

        if (selected.vitals) {
          addSectionTitle('Controles Vitales (Últimos 7 días)');
          const recentVitals = vitalSigns.filter(v => v.date >= limitStr && v.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentVitals.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin controles registrados.', margin, y);
            y += 8;
          } else {
            const tableData = recentVitals.map(v => [
              formatDateDDMMYYYY(v.date),
              formatTime12h(v.time),
              v.type,
              `${v.value} ${v.unit}`,
              v.registeredBy
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Fecha', 'Hora', 'Tipo', 'Valor', 'Por']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }
        
        if (selected.incidentes) {
          addSectionTitle('Incidentes (Últimos 7 días)');
          const recentIncidents = incidents.filter(i => i.date >= limitStr && i.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentIncidents.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin incidentes.', margin, y);
            y += 8;
          } else {
            const tableData = recentIncidents.map(i => [
              `${formatDateDDMMYYYY(i.date)} ${formatTime12h(i.time)}`,
              i.type,
              i.status,
              i.description,
              i.actions
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Fecha/Hora', 'Tipo', 'Estado', 'Descripción', 'Acciones']],
              body: tableData,
              theme: 'grid',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9, cellPadding: 3 },
              columnStyles: { 3: { cellWidth: 50 }, 4: { cellWidth: 50 } },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }
        
        if (selected.turnos) {
          addSectionTitle('Turnos (Últimos 7 días)');
          const recentShifts = shifts.filter(s => s.date >= limitStr && s.date <= todayStr).sort((a,b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
          if (recentShifts.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin turnos.', margin, y);
            y += 8;
          } else {
            const tableData = recentShifts.map(s => [
              formatDateDDMMYYYY(s.date),
              formatTime12h(s.startTime),
              s.userName,
              s.status,
              s.report || ''
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Fecha', 'Inicio', 'Cuidador', 'Estado', 'Parte']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }

        if (selected.documents) {
          addSectionTitle('Documentos y Estudios Clínicos');
          if (documents.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin registros.', margin, y);
            y += 8;
          } else {
            const tableData = documents.map(d => [
              formatDateDDMMYYYY(d.date),
              d.name,
              d.category,
              `Dr/a. ${d.professional}`,
              d.description || ''
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Fecha', 'Documento', 'Categoría', 'Profesional', 'Desc.']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
            y += 5;
          }
        }
        
        if (selected.timeline) {
          addSectionTitle('Historial Cronológico (Últimos 7 días)');
          const recentEvents = timeline.filter(t => t.date >= limitStr && t.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentEvents.length === 0) {
            doc.setFontSize(10);
            doc.text('Sin eventos.', margin, y);
            y += 8;
          } else {
            const tableData = recentEvents.map(e => [
              `${formatDateDDMMYYYY(e.date)} ${formatTime12h(e.time)}`,
              e.title,
              e.user,
              e.description
            ]);
            autoTable(doc, {
              startY: y,
              head: [['Fecha/Hora', 'Título', 'Usuario', 'Descripción']],
              body: tableData,
              theme: 'striped',
              headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
              styles: { fontSize: 9 },
              margin: { left: margin, right: margin },
              didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }
            });
          }
        }

        const fileName = `Reporte_CuidaPlus_${todayStr}.pdf`;

        // Page numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

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
      } catch (err: any) {
        setErrorMsg('Ocurrió un error al generar el reporte.');
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {errorMsg}
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="text-gray-500">Generación de informes clínicos (Últimos 7 días)</p>
        </div>
        <button 
          onClick={generatePDF}
          disabled={isGenerating || !Object.values(selected).some(v => v)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Generando...</span>
          ) : (
            <><FileDown className="w-5 h-5 mr-2" /> Descargar PDF</>
          )}
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="font-bold text-lg mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          Configurar contenido del reporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.personal ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.personal} onChange={() => toggle('personal')} />
            <span className="font-medium">Datos Personales y Médicos</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.medication ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.medication} onChange={() => toggle('medication')} />
            <span className="font-medium">Tratamientos Activos</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.tomas ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.tomas} onChange={() => toggle('tomas')} />
            <span className="font-medium">Tomas de Medicación</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.vitals ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.vitals} onChange={() => toggle('vitals')} />
            <span className="font-medium">Controles Vitales</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.incidentes ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.incidentes} onChange={() => toggle('incidentes')} />
            <span className="font-medium">Incidentes</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.turnos ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.turnos} onChange={() => toggle('turnos')} />
            <span className="font-medium">Turnos de Cuidado</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.documents ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.documents} onChange={() => toggle('documents')} />
            <span className="font-medium">Documentos y Estudios Clínicos</span>
          </label>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selected.timeline ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="mr-3 w-5 h-5" checked={selected.timeline} onChange={() => toggle('timeline')} />
            <span className="font-medium">Historial Cronológico / Notas</span>
          </label>
        </div>
      </div>
    </div>
  );
}
