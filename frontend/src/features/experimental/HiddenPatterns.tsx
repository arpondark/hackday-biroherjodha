import React, { useEffect, useRef, useState } from 'react';

export const HiddenPatterns: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focusTime, setFocusTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const intensity = focusTime / 5; // Reaches full intensity after 5 seconds

      for (let i = 0; i < 200; i++) {
        const x = (i * 50) % canvas.width;
        const y = Math.floor(i / (canvas.width / 50)) * 50;
        
        const noise = Math.sin(time + i * 0.1) * 2;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + intensity * 0.1})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (intensity < 0.2) {
            // Random-looking grid
            ctx.moveTo(x + noise, y);
            ctx.lineTo(x + 10 + noise, y + 10);
        } else {
            // Evolving pattern: Loneliness (dots drifting apart) or Tension (jagged lines)
            const offsetX = Math.cos(time + i) * (10 + intensity * 20);
            const offsetY = Math.sin(time + i) * (10 + intensity * 20);
            ctx.moveTo(x + offsetX, y + offsetY);
            ctx.lineTo(x + offsetX + 2, y + offsetY + 2);
            
            // Subtle distortion based on intensity
            if (intensity > 0.8) {
                ctx.strokeStyle = `rgba(200, 100, 255, ${intensity * 0.3})`;
            }
        }
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    let interval: number;
    if (isHovering) {
      interval = window.setInterval(() => {
        setFocusTime(prev => Math.min(prev + 0.1, 5));
      }, 100);
    } else {
      setFocusTime(0);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, [focusTime, isHovering]);

  return (
    <div 
      className="relative w-full h-screen bg-black cursor-crosshair"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/20 text-sm italic">
        Stay still. Watch the noise.
      </div>
    </div>
  );
};
