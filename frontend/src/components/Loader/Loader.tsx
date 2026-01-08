import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, message }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-background-darker z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClass}>
      {/* Animated background for fullscreen */}
      {fullScreen && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent-secondary/10 blur-3xl"
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      )}

      {/* Main loader */}
      <div className="relative z-10">
        {/* Outer ring */}
        <motion.div
          className="w-20 h-20 rounded-full border-2 border-accent-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Middle spinning ring */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent-primary border-r-accent-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent border-b-accent-secondary border-l-accent-secondary"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Core pulse */}
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent-primary"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, 40, 0, -40, 0].map(v => v * Math.cos(i * (2 * Math.PI / 3))),
              y: [0, 40, 0, -40, 0].map(v => v * Math.sin(i * (2 * Math.PI / 3))),
              scale: [1, 0.5, 1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      {(fullScreen || message) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center z-10"
        >
          <motion.p 
            className="text-white/60 text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message || 'Loading your emotional space...'}
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};
