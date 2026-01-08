import React, { useRef, useEffect } from 'react';

interface HiddenPatternsCanvasProps {
  color: string;
}

export const HiddenPatternsCanvas: React.FC<HiddenPatternsCanvasProps> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, stillness: 0 });

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
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tessellation / Pattern grid
      const size = 50;
      const rows = Math.ceil(canvas.height / size);
      const cols = Math.ceil(canvas.width / size);

      for(let y=0; y<rows; y++) {
          for(let x=0; x<cols; x++) {
              const cx = x * size + size/2;
              const cy = y * size + size/2;
              
              // Pattern reveals based on stillness accumulator
              const reveal = Math.min(1, mouseRef.current.stillness / 200);
              
              const dx = mouseRef.current.x - cx;
              const dy = mouseRef.current.y - cy;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              // Interactive ripple
              const offset = Math.sin(dist * 0.05 - time) * 10 * (1-reveal);
              
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(time * 0.1 + (x+y)*0.5 * reveal);
              
              ctx.strokeStyle = color;
              ctx.globalAlpha = 0.1 + (reveal * 0.5);
              ctx.lineWidth = 1 + reveal * 2;
              
              if(reveal > 0.5) {
                // Sacred geometry / distinct shapes emerge
                ctx.beginPath();
                ctx.moveTo(-10, -10);
                ctx.lineTo(10, -10);
                ctx.lineTo(0, 10);
                ctx.closePath();
                ctx.stroke();
              } else {
                // Chaotic lines
                ctx.beginPath();
                ctx.moveTo(-10 + offset, -10);
                ctx.lineTo(10 + offset, 10);
                ctx.stroke();
              }
              
              ctx.restore();
          }
      }
      
      mouseRef.current.stillness++;
      time += 0.02;
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.stillness = 0; // Reset stillness on move
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
