import React from 'react';

const Placeholder = ({ name, className }: { name: string, className?: string }) => (
  <div className={`w-full h-full flex items-center justify-center bg-gray-200 rounded text-gray-500 font-bold text-xs text-center p-2 border border-dashed border-gray-400 ${className || ''}`}>
    [MARCADOR PARA LOGO OFICIAL: {name}]
  </div>
);

export const SponsorsList = [
  { id: 'osde', name: 'OSDE', Component: (props: any) => <Placeholder name="OSDE" {...props} /> },
  { id: 'swiss-medical', name: 'Swiss Medical', Component: (props: any) => <Placeholder name="Swiss Medical" {...props} /> },
  { id: 'galeno', name: 'Galeno', Component: (props: any) => <Placeholder name="Galeno" {...props} /> },
  { id: 'hospital-italiano', name: 'Hospital Italiano', Component: (props: any) => <Placeholder name="Hospital Italiano" {...props} /> },
  { id: 'tena', name: 'TENA', Component: (props: any) => <Placeholder name="TENA" {...props} /> },
  { id: 'pampers', name: 'Pampers', Component: (props: any) => <Placeholder name="Pampers" {...props} /> },
];
