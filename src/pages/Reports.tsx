import React, { useState } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
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
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxTextWidth = pageWidth - margin * 2;
        
        // Header
        doc.setFillColor(30, 58, 95); // Primary color
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('CUIDA+', margin, 25);
        doc.setFontSize(12);
        doc.text('Reporte Clínico', 150, 25);
        
        let y = 50;
        doc.setTextColor(0, 0, 0);

        const checkPageBreak = (spaceNeeded: number) => {
          if (y + spaceNeeded > 280) {
            doc.addPage();
            y = 20;
          }
        };

        const writeWrappedText = (text: string, fontSize: number, bold: boolean = false, xOff: number = 0) => {
          doc.setFontSize(fontSize);
          doc.setFont("helvetica", bold ? "bold" : "normal");
          const lines = doc.splitTextToSize(text, maxTextWidth - xOff);
          checkPageBreak(lines.length * (fontSize * 0.4));
          doc.text(lines, margin + xOff, y);
          y += lines.length * (fontSize * 0.4) + 2;
        };

        if (selected.personal) {
          checkPageBreak(50);
          writeWrappedText('Datos Personales y Médicos', 16, true);
          y += 5;
          writeWrappedText(`Paciente: ${patient.name} (${patient.age} años)`, 11);
          writeWrappedText(`Contacto: ${patient.mainContact} (${patient.mainContactPhone})`, 11);
          writeWrappedText(`Obra Social: ${patient.healthInsurance}`, 11);
          writeWrappedText(`Alergias: ${patient.allergies.join(', ') || 'Ninguna'}`, 11);
          writeWrappedText(`Diagnósticos: ${patient.diagnoses.join(', ')}`, 11);
          writeWrappedText(`Observaciones: ${patient.observations}`, 11);
          y += 10;
        }

        if (selected.medication) {
          checkPageBreak(20);
          writeWrappedText('Tratamientos Activos', 16, true);
          y += 5;
          const activeT = treatments.filter(t => t.status === 'active');
          if (activeT.length === 0) {
            writeWrappedText('Sin tratamientos activos.', 11);
          } else {
            activeT.forEach(t => {
              writeWrappedText(`• ${t.medicationName} ${t.presentation} - ${t.quantityPerDose} ${t.unit} (${t.frequency})`, 11);
            });
          }
          y += 10;
        }
        
        // Last 7 days calc (today and previous 6 days)
        const todayStr = getLocalDateString();
        const parts = todayStr.split('-');
        const todayDateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const sixDaysAgo = new Date(todayDateObj);
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
        const limitStr = `${sixDaysAgo.getFullYear()}-${String(sixDaysAgo.getMonth()+1).padStart(2,'0')}-${String(sixDaysAgo.getDate()).padStart(2,'0')}`;
        
        if (selected.tomas) {
          checkPageBreak(20);
          writeWrappedText('Tomas de Medicación (Últimos 7 días)', 16, true);
          y += 5;
          const recentDoses = doses.filter(d => d.date >= limitStr && d.date <= todayStr && d.status !== 'pending').sort((a,b) => (b.date + b.actualTime).localeCompare(a.date + a.actualTime));
          if (recentDoses.length === 0) {
            writeWrappedText('Sin tomas registradas.', 11);
          } else {
            recentDoses.forEach(d => {
              const t = treatments.find(tr => tr.id === d.treatmentId);
              const statusTxt = d.status === 'taken' ? 'Tomado' : 'Omitido';
              writeWrappedText(`• ${d.date} ${d.actualTime} - ${t?.medicationName} (${statusTxt}) por ${d.registeredBy}`, 11);
              if (d.status === 'missed' && d.observations) {
                writeWrappedText(`  Motivo: ${d.observations}`, 10, false, 5);
              }
            });
          }
          y += 10;
        }

        if (selected.vitals) {
          checkPageBreak(20);
          writeWrappedText('Controles Vitales (Últimos 7 días)', 16, true);
          y += 5;
          const recentVitals = vitalSigns.filter(v => v.date >= limitStr && v.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentVitals.length === 0) {
            writeWrappedText('Sin controles registrados.', 11);
          } else {
            recentVitals.forEach(v => {
              writeWrappedText(`• ${v.date} ${v.time}: ${v.type} - ${v.value} ${v.unit} (${v.registeredBy})`, 11);
            });
          }
          y += 10;
        }
        
        if (selected.incidentes) {
          checkPageBreak(20);
          writeWrappedText('Incidentes (Últimos 7 días)', 16, true);
          y += 5;
          const recentIncidents = incidents.filter(i => i.date >= limitStr && i.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentIncidents.length === 0) {
            writeWrappedText('Sin incidentes.', 11);
          } else {
            recentIncidents.forEach(i => {
              writeWrappedText(`• ${i.date} ${i.time} - ${i.type} (${i.status})`, 11, true);
              writeWrappedText(`  Desc: ${i.description}`, 11, false, 5);
              writeWrappedText(`  Acciones: ${i.actions}`, 11, false, 5);
            });
          }
          y += 10;
        }
        
        if (selected.turnos) {
          checkPageBreak(20);
          writeWrappedText('Turnos (Últimos 7 días)', 16, true);
          y += 5;
          const recentShifts = shifts.filter(s => s.date >= limitStr && s.date <= todayStr).sort((a,b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
          if (recentShifts.length === 0) {
            writeWrappedText('Sin turnos.', 11);
          } else {
            recentShifts.forEach(s => {
              writeWrappedText(`• ${s.date} ${s.startTime} - ${s.userName} (${s.status})`, 11, true);
              if (s.report) {
                writeWrappedText(`  Parte: ${s.report}`, 11, false, 5);
              }
            });
          }
          y += 10;
        }

        if (selected.documents) {
          checkPageBreak(20);
          writeWrappedText('Documentos y Estudios Clínicos', 16, true);
          y += 5;
          if (documents.length === 0) {
            writeWrappedText('Sin registros.', 11);
          } else {
            documents.forEach(d => {
              writeWrappedText(`• ${d.date} | ${d.name} (${d.category}) - Dr/a. ${d.professional}`, 11);
              if (d.description) {
                writeWrappedText(`  Desc: ${d.description}`, 11, false, 5);
              }
            });
          }
          y += 10;
        }
        
        if (selected.timeline) {
          checkPageBreak(20);
          writeWrappedText('Historial Cronológico (Últimos 7 días)', 16, true);
          y += 5;
          const recentEvents = timeline.filter(t => t.date >= limitStr && t.date <= todayStr).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
          if (recentEvents.length === 0) {
            writeWrappedText('Sin eventos.', 11);
          } else {
            recentEvents.forEach(e => {
              writeWrappedText(`[${e.date} ${e.time}] ${e.title} - ${e.user}`, 10, true);
              writeWrappedText(`${e.description}`, 10, false, 5);
            });
          }
        }

        const fileName = `Reporte_CuidaPlus_${todayStr}.pdf`;

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
