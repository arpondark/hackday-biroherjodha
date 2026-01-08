import React, { useEffect, useRef, useState } from 'react';

export const MemoryEcho: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const trails = useRef<Array<{ x: number; y: number; alpha: number; age: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stopTimeout: number;

    const handleMouseMove = (e: MouseEvent) => {
      setIsMoving(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      
      clearTimeout(stopTimeout);
      stopTimeout = window.setTimeout(() => {
        setIsMoving(false);
        // Create an "echo" when stopping
        trails.current.push({ 
          x: lastMousePos.current.x, 
          y: lastMousePos.current.y, 
          alpha: 0.8,
          age: 0
        });
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrame: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isMoving) {
        ctx.beginPath();
        ctx.arc(lastMousePos.current.x, lastMousePos.current.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }

      // Draw trails (echoes)
      trails.current.forEach((trail, index) => {
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, 5 + trail.age, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${trail.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        trail.alpha -= 0.005;
        trail.age += 0.5;

        if (trail.alpha <= 0) {
          trails.current.splice(index, 1);
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      clearTimeout(stopTimeout);
    };
  }, [isMoving]);

  return (
    <div className="w-full h-screen bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-10 right-10 text-white/30 text-xs">
        Move and stop to leave an echo.
      </div>
    </div>
  );
};
