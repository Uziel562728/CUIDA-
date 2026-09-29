import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore'
import { getLocalDateString } from '../utils/date';
import { Clock, Filter, Activity, Pill, User, AlertTriangle, FileText, ShoppingCart } from 'lucide-react';
import { TimelineEvent } from '../types';
import gsap from 'gsap';

const getIconForType = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'medication': return <Pill className="w-5 h-5" />;
    case 'control': return <Activity className="w-5 h-5" />;
    case 'shift': return <User className="w-5 h-5" />;
    case 'incident': return <AlertTriangle className="w-5 h-5" />;
    case 'document': return <FileText className="w-5 h-5" />;
    case 'order': return <ShoppingCart className="w-5 h-5" />;
    default: return <Clock className="w-5 h-5" />;
  }
};

const getColorForType = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'medication': return 'bg-health text-white';
    case 'incident': return 'bg-danger text-white';
    case 'control': return 'bg-info text-white';
    case 'shift': return 'bg-primary text-white';
    case 'order': return 'bg-secondary text-white';
    default: return 'bg-gray-200 text-gray-700';
  }
};

export default function Timeline() {
  const { timeline } = useStore();
  const [filter, setFilter] = useState<TimelineEvent['type'] | 'all'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTimeline = filter === 'all' ? timeline : timeline.filter(t => t.type === filter);

  // Group by date
  const groupedTimeline = filteredTimeline.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (containerRef.current && !prefersReducedMotion) {
      const elements = containerRef.current.querySelectorAll('.gsap-timeline-item');
      
      gsap.fromTo(elements, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }, [filter, timeline]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial Clínico</h2>
          <p className="text-gray-500">Eventos ordenados cronológicamente</p>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter className="w-5 h-5 text-gray-400 mr-1 flex-shrink-0" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos los eventos</option>
            <option value="medication">Medicación</option>
            <option value="control">Controles</option>
            <option value="shift">Turnos</option>
            <option value="incident">Incidentes</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8" ref={containerRef}>
        <div className="relative border-l-2 border-gray-100 ml-4 md:ml-8 space-y-8">
          {Object.keys(groupedTimeline).length === 0 ? (
            <p className="text-gray-500 ml-8 py-4">No hay eventos para mostrar.</p>
          ) : (
            Object.entries(groupedTimeline).map(([date, events]) => (
              <div key={date}>
                <div className="relative mb-6">
                  <span className="absolute -left-[1.3rem] md:-left-[2.35rem] top-0 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 border border-gray-200">
                    {date === getLocalDateString() ? 'HOY' : date}
                  </span>
                </div>
                
                <div className="space-y-6 mt-8">
                  {events.map((event) => (
                    <div key={event.id} className="relative pl-8 md:pl-12 gsap-timeline-item">
                      <div className={`absolute -left-[1.1rem] md:-left-[1.1rem] top-0 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${getColorForType(event.type)}`}>
                        <div className="scale-75">{getIconForType(event.type)}</div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-start mb-2">
                          <h4 className="font-bold text-gray-900">{event.title}</h4>
                          <span className="text-sm font-semibold text-gray-500">{event.time}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{event.description}</p>
                        <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <User className="w-3 h-3 mr-1" />
                          Registrado por {event.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
