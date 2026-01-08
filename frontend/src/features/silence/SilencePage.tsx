import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Play, Square } from 'lucide-react';
import { cn } from '@/utils/cn';

export const SilencePage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [duration, setDuration] = useState(300);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setPreset = (mins: number) => {
    setIsActive(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  return (
    <div className="w-full py-16 px-4 container mx-auto flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10"
          >
            <Wind className="w-8 h-8 text-accent-secondary" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-wide">Enter the Silence</h1>
          <p className="text-white/60">Take a moment to disconnect and breathe.</p>
        </div>

        {/* Timer Display */}
        <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
          {/* Animated Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/10"
            animate={isActive ? { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent-secondary/30"
            animate={isActive ? { rotate: 360 } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="text-6xl font-light text-white font-mono">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8">
          <button
            onClick={toggleTimer}
            className={cn(
              "p-4 rounded-full transition-all duration-300 hover:scale-105",
              isActive 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/25"
            )}
          >
            {isActive ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
          </button>

          {/* Presets */}
          <div className="flex justify-center gap-4">
            {[1, 5, 10, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => setPreset(mins)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  duration === mins * 60
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
