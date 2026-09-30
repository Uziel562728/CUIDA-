import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Home, ChevronRight } from 'lucide-react';
import { SponsorsList } from '../components/SponsorLogos';
import { useStore } from '../store/useStore';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { isSponsorsEnabled } from '../config/sponsors';

export default function Welcome() {
  const navigate = useNavigate();
  const { setHasSeenWelcome } = useStore();
  const [showLogos, setShowLogos] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Hide native splash screen as soon as React mounts this component
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(console.error);
    }

    if (!isSponsorsEnabled) {
      // If sponsors are disabled, we don't show the sequence.
      // But we still want to show the CUIDA+ logo for a moment before the user continues.
      return;
    }

    // Sequence: show CUIDA+ first, then logos after 2 seconds
    const timer = setTimeout(() => {
      setShowLogos(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setHasSeenWelcome(true);
    navigate('/login', { replace: true });
  };

  const transitionDuration = shouldReduceMotion ? 0 : 0.6;
  const buttonTransitionDelay = shouldReduceMotion ? 0 : 0.2;

  return (
    <div className="fixed inset-0 flex flex-col bg-blue-50 dark:bg-gray-900 z-[9999] overflow-hidden">
      {/* Top Background decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Step 1: CUIDA+ Identity */}
        <AnimatePresence mode="wait">
          {!showLogos ? (
            <motion.div
              key="brand"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
              transition={{ duration: transitionDuration }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                <Home className="w-24 h-24 text-primary-custom" />
                <HeartPulse className="w-12 h-12 text-blue-500 absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1" />
              </div>
              <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">
                CUIDA<span className="text-primary-custom">+</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                Tu paciente, siempre cuidado
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="sponsors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: transitionDuration }}
              className="w-full flex flex-col items-center text-center max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Las mejores empresas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                se unen para brindarte esta app
              </p>

              {/* Logos grid with staggered animation */}
              <motion.div 
                className="grid grid-cols-2 gap-4 w-full"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: shouldReduceMotion ? 0 : 0.1
                    }
                  }
                }}
              >
                {SponsorsList.map((sponsor) => (
                  <motion.div
                    key={sponsor.id}
                    variants={{
                      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm flex items-center justify-center h-24"
                  >
                    <sponsor.Component />
                  </motion.div>
                ))}
              </motion.div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 max-w-xs">
                Estas empresas te facilitan la vida dándote esta app para el control de cuidado domiciliario.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Action Button - Visible Immediately */}
      <motion.div 
        className="p-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0, duration: 0 }}
      >
        <button
          onClick={handleContinue}
          className="w-full bg-primary-custom text-white rounded-xl py-4 font-semibold text-lg flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          {showLogos || !isSponsorsEnabled ? 'Continuar' : 'Omitir'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </motion.div>
    </div>
  );
}
