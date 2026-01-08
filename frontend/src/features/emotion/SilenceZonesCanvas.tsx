import React, { useRef, useEffect } from 'react';

interface SilenceZonesCanvasProps {
  color: string;
}

export const SilenceZonesCanvas: React.FC<SilenceZonesCanvasProps> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

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
    
    // Static noise background
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 100;
    noiseCanvas.height = 100;
    const nCtx = noiseCanvas.getContext('2d');
    if(nCtx) {
        for(let i=0; i<1000; i++) {
            nCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
            nCtx.fillRect(Math.random()*100, Math.random()*100, 1, 1);
        }
    }

    const zones = [
        { x: 0.3, y: 0.3, r: 100 },
        { x: 0.7, y: 0.7, r: 150 },
        { x: 0.8, y: 0.2, r: 80 }
    ]; // relative coords

    let time = 0;
    const animate = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw noise
      ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat') || '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      zones.forEach(zone => {
          const zx = zone.x * canvas.width;
          const zy = zone.y * canvas.height;
          
          const dx = mouseRef.current.x - zx;
          const dy = mouseRef.current.y - zy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Silence effect: closer to zone center = clearer view, less noise
          const opacity = Math.min(1, Math.max(0, (dist - 50) / 200));
          
          // Zone drawing
          const grad = ctx.createRadialGradient(zx, zy, 0, zx, zy, zone.r);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'transparent');
          
          ctx.globalAlpha = 1 - opacity + 0.1;
          ctx.beginPath();
          ctx.arc(zx, zy, zone.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Orbiters
          ctx.beginPath();
          ctx.arc(
            zx + Math.cos(time + zx) * (zone.r * 0.5), 
            zy + Math.sin(time + zy) * (zone.r * 0.5), 
            3, 0, Math.PI * 2
          );
          ctx.fillStyle = '#fff';
          ctx.fill();
      });

      time += 0.02;
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />;
};
