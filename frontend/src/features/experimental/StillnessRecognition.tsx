import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StillnessRecognition: React.FC = () => {
  const [isStill, setIsStill] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsStill(false);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 3000) {
        setIsStill(true);
      }
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(interval);
    };
  }, [lastActivity]);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center transition-colors duration-1000">
      <AnimatePresence>
        {isStill ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.div 
                className="w-48 h-48 bg-white/5 rounded-full blur-3xl mx-auto"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 10, repeat: Infinity }}
            />
            <p className="mt-8 text-white/40 font-light tracking-[0.5em] uppercase text-xs animate-pulse">
                Found in the pause
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/10 text-xs uppercase tracking-widest"
          >
            Awaiting Stillness
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 text-[10px] text-white/20">
        Stop moving for 3 seconds.
      </div>
    </div>
  );
};
