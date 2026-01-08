import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Zone {
  x: number;
  y: number;
  radius: number;
}

export const SilenceZones: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [silenceLevel, setSilenceLevel] = useState(0); // 0 to 1
  const zones = useRef<Zone[]>([
    { x: 200, y: 200, radius: 150 },
    { x: 600, y: 400, radius: 200 },
    { x: 800, y: 200, radius: 100 },
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      let maxSilence = 0;
      zones.current.forEach(zone => {
        const dx = e.clientX - zone.x;
        const dy = e.clientY - zone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < zone.radius) {
          const depth = 1 - (dist / zone.radius);
          if (depth > maxSilence) maxSilence = depth;
        }
      });
      setSilenceLevel(maxSilence);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="relative w-full h-screen bg-neutral-900 overflow-hidden"
      style={{
        filter: `contrast(${100 + silenceLevel * 50}%) brightness(${100 - silenceLevel * 30}%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="text-white text-9xl font-bold opacity-10"
          style={{
             letterSpacing: `${silenceLevel * 20}px`,
             filter: `blur(${silenceLevel * 10}px)`,
             transition: 'all 0.3s ease-out'
          }}
        >
          SILENCE
        </div>
      </div>

      {zones.current.map((zone, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/5 pointer-events-none"
          style={{
            left: zone.x - zone.radius,
            top: zone.y - zone.radius,
            width: zone.radius * 2,
            height: zone.radius * 2,
            background: `radial-gradient(circle, rgba(255,255,255,${0.02 * silenceLevel}) 0%, transparent 70%)`,
          }}
        />
      ))}

      <motion.div
        className="absolute w-4 h-4 rounded-full bg-white/20 pointer-events-none"
        animate={{ x: mousePos.x - 8, y: mousePos.y - 8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      />
      
      {/* Audio simulation: in a real app, this would control volume */}
      <div className="absolute bottom-10 left-10 text-white/50 text-sm">
        Sound Absorption: {Math.round(silenceLevel * 100)}%
      </div>
    </div>
  );
};
