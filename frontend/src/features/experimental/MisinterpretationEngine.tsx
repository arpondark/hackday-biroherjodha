import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const MisinterpretationEngine: React.FC = () => {
  // Randomize parameters once per mount
  const params = useMemo(() => ({
    count: Math.floor(Math.random() * 50) + 20,
    speed: Math.random() * 5 + 2,
    radius: Math.random() * 100 + 50,
    opacity: Math.random() * 0.5 + 0.1,
    blur: Math.random() * 20 + 5,
    color: `hsl(${Math.random() * 360}, 50%, 50%)`
  }), []);

  return (
    <div className="w-full h-screen bg-neutral-900 flex items-center justify-center overflow-hidden">
      <div className="relative">
        {Array.from({ length: params.count }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: [1, 2, 1],
                opacity: [0, params.opacity, 0],
                rotate: [0, 360]
            }}
            transition={{
                duration: params.speed + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
            }}
            style={{
                width: params.radius,
                height: params.radius,
                left: -params.radius / 2,
                top: -params.radius / 2,
                filter: `blur(${params.blur}px)`,
                borderColor: params.color
            }}
          />
        ))}
      </div>
      
      <div className="absolute bottom-20 text-center text-white/20 select-none">
        <p className="text-sm font-serif italic">"What do you see?"</p>
        <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">Seed: {Math.random().toString(36).substring(7)}</p>
      </div>
    </div>
  );
};
