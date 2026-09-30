import React from 'react';
import osdeLogo from '../images/idPU-XdFhn_logos.png';
import swissMedicalLogo from '../images/idvq_NRBbL_logos.png';
import hospitalItalianoLogo from '../images/Hospital_Italiano_de_Buenos_Aires_logo.svg';
import tenaLogo from '../images/idx1rmWYcN_1790799680824.png';
import pampersLogo from '../images/Pampers_id_yrvrfqd_1.svg';

const LogoWrapper = ({ src, alt, className = "", whiteBg = false, withText = "" }: { src: string, alt: string, className?: string, whiteBg?: boolean, withText?: string }) => (
  <div className={`w-full h-full flex items-center justify-center p-2 ${whiteBg ? 'bg-white rounded-lg' : ''}`}>
    <img src={src} alt={alt} className={`max-h-full max-w-full object-contain ${className}`} style={{ maxHeight: '100%' }} />
    {withText && <span className="ml-2 font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base whitespace-nowrap">{withText}</span>}
  </div>
);

export const SponsorsList = [
  { id: 'osde', name: 'OSDE', Component: (props: any) => <LogoWrapper src={osdeLogo} alt="OSDE" {...props} /> },
  { id: 'swiss-medical', name: 'Swiss Medical', Component: (props: any) => <LogoWrapper src={swissMedicalLogo} alt="Swiss Medical" withText="Swiss Medical" className="!h-8" {...props} /> },
  { id: 'hospital-italiano', name: 'Hospital Italiano', Component: (props: any) => <LogoWrapper src={hospitalItalianoLogo} alt="Hospital Italiano" {...props} /> },
  { id: 'tena', name: 'TENA', Component: (props: any) => <LogoWrapper src={tenaLogo} alt="TENA" whiteBg={true} {...props} /> },
  { id: 'pampers', name: 'Pampers', Component: (props: any) => <LogoWrapper src={pampersLogo} alt="Pampers" {...props} /> },
];
