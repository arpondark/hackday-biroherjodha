import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const UnspokenDialogue: React.FC = () => {
  const [pos1, setPos1] = useState({ x: 300, y: 300 });
  const [pos2, setPos2] = useState({ x: 600, y: 400 });
  const [tension, setTension] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos1({ x: e.clientX, y: e.clientY });
    };

    const interval = setInterval(() => {
        setPos2(prev => {
            const dx = pos1.x - prev.x;
            const dy = pos1.y - prev.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            setTension(Math.max(0, 1 - dist / 500));

            // Follow but keep distance
            const targetDist = 200;
            const speed = 0.05;
            
            if (dist > targetDist) {
                return {
                    x: prev.x + dx * speed,
                    y: prev.y + dy * speed
                };
            } else {
                // Back off if too close
                return {
                    x: prev.x - dx * speed,
                    y: prev.y - dy * speed
                };
            }
        });
    }, 30);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        clearInterval(interval);
    };
  }, [pos1]);

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* Entity 1 (Controlled) */}
      <motion.div
        className="absolute w-32 h-32 rounded-full blur-2xl"
        animate={{ 
            x: pos1.x - 64, 
            y: pos1.y - 64,
            scale: 1 + tension * 0.5,
            backgroundColor: tension > 0.7 ? '#ef4444' : '#60a5fa'
        }}
        transition={{ type: 'spring', damping: 10 }}
      />

      {/* Entity 2 (AI) */}
      <motion.div
        className="absolute w-32 h-32 rounded-full blur-2xl"
        animate={{ 
            x: pos2.x - 64, 
            y: pos2.y - 64,
            scale: 1 + tension * 0.3,
            backgroundColor: tension > 0.7 ? '#f97316' : '#a855f7'
        }}
        transition={{ type: 'spring', damping: 20 }}
      />

      <div className="absolute bottom-10 text-white/10 uppercase tracking-[1em] text-sm italic">
        Distance is the language
      </div>
    </div>
  );
};
