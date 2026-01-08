import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingCanvasProps {
  color: string;
}

export const BreathingCanvas: React.FC<BreathingCanvasProps> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Simulate breathing rhythm
      // Inhale (expand) and Exhale (contract)
      const breathCycle = (Math.sin(time) + 1) / 2; // 0 to 1
      const radius = 50 + breathCycle * 100;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Particles following breath
      const particles = 8;
      for(let i=0; i<particles; i++) {
         const angle = (Math.PI * 2 / particles) * i + time * 0.5;
         const pRadius = radius + Math.sin(time * 3 + i) * 10;
         const x = centerX + Math.cos(angle) * pRadius;
         const y = centerY + Math.sin(angle) * pRadius;
         
         ctx.beginPath();
         ctx.arc(x, y, 4, 0, Math.PI * 2);
         ctx.fillStyle = color;
         ctx.fill();
      }

      time += 0.02;
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, [color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
