import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatternType } from '@/utils/emotions';
import { hexToRgba } from '@/utils/emotions';

export type CanvasMode = 'Controls' | 'Draw' | 'Generate' | 'Rhythm';

interface EmotionCanvasProps {
  color: string;
  pattern: PatternType;
  motionIntensity: number;
  mode?: CanvasMode;
}

export const EmotionCanvas: React.FC<EmotionCanvasProps> = ({
  color,
  pattern,
  motionIntensity,
  mode = 'Controls',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const pathsRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const isDrawingRef = useRef(false);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'Draw') return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    pathsRef.current.push([{ x, y }]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || mode !== 'Draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const currentPath = pathsRef.current[pathsRef.current.length - 1];
    currentPath.push({ x, y });
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth * window.devicePixelRatio;
        canvas.height = parent.offsetHeight * window.devicePixelRatio;
        // ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Scaling handled manually in draw coords for precision
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    let time = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * motionIntensity,
        vy: (Math.random() - 0.5) * motionIntensity,
        size: Math.random() * 4 + 2,
      });
    }

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // In drawing mode, we don't clear perfectly to allow trails, 
      // but here we are redrawing paths every frame, so we MUST clear.
      ctx.clearRect(0, 0, width, height);
      
      time += 0.01 * motionIntensity;

      if (mode === 'Draw') {
        // Draw all stored paths
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        pathsRef.current.forEach(path => {
          if (path.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.stroke();
        });
        
        // Add a "brush" cursor effect
        if(!isDrawingRef.current) {
            // Optional: Draw floating cursor
        }

      } else if (mode === 'Rhythm') {
        drawRhythm(ctx, width, height, color, time, motionIntensity);
      } else {
        // Standard modes (Controls/Generate)
        drawPattern(ctx, pattern, width, height, color, time, motionIntensity, particles);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [color, pattern, motionIntensity, mode]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`w-full h-full ${mode === 'Draw' ? 'cursor-crosshair' : 'cursor-default'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};

// Helper for patterns
function drawPattern(
    ctx: CanvasRenderingContext2D,
    pattern: PatternType,
    width: number,
    height: number,
    color: string,
    time: number,
    intensity: number,
    particles: any[]
) {
    switch (pattern) {
        case 'waves':
          drawWaves(ctx, width, height, color, time, intensity);
          break;
        case 'circles':
          drawCircles(ctx, width, height, color, time, intensity);
          break;
        case 'spirals':
          drawSpirals(ctx, width, height, color, time, intensity);
          break;
        case 'particles':
          drawParticles(ctx, width, height, color, particles);
          break;
        case 'flow':
          drawFlow(ctx, width, height, color, time, intensity);
          break;
        case 'pulse':
          drawPulse(ctx, width, height, color, time, intensity);
          break;
        case 'ripples':
          drawRipples(ctx, width, height, color, time, intensity);
          break;
        case 'draw':
          // Simulate drawing for playback
          drawFlow(ctx, width, height, color, time, intensity * 1.5); 
          break;
        case 'rhythm':
          drawRhythm(ctx, width, height, color, time, intensity);
          break;
      }
}

// Draw functions
function drawWaves(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
  const waves = 5;
  for (let i = 0; i < waves; i++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.3 - i * 0.05);
    ctx.lineWidth = 3;
    for (let x = 0; x < width; x += 5) {
      const y = height / 2 + Math.sin(x * 0.01 + time + i * 0.5) * 50 * intensity + Math.sin(x * 0.02 + time * 0.5) * 30 * intensity;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawCircles(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const circles = 8;
  for (let i = 0; i < circles; i++) {
    const radius = Math.abs((i * 40 + time * 20 * intensity) % (Math.max(width, height) / 2));
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(color, 0.4 - (radius / Math.max(width, height)) * 0.4);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawSpirals(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const spirals = 3;
  for (let s = 0; s < spirals; s++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.4);
    ctx.lineWidth = 2;
    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = angle * 5 * intensity;
      const x = centerX + Math.cos(angle + time + s * 2) * radius;
      const y = centerY + Math.sin(angle + time + s * 2) * radius;
      angle === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, particles: any[]) {
  particles.forEach((particle: any) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.6);
    ctx.fill();
    particles.forEach((other: any) => {
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = hexToRgba(color, 0.2 * (1 - distance / 100));
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  });
}

function drawFlow(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
  const lines = 20;
  for (let i = 0; i < lines; i++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.3);
    ctx.lineWidth = 2;
    const startY = (height / lines) * i;
    for (let x = 0; x < width; x += 10) {
      const y = startY + Math.sin(x * 0.02 + time + i * 0.2) * 20 * intensity;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawPulse(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const pulseSize = Math.abs(Math.sin(time * intensity)) * 100 + 50;
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 2);
  gradient.addColorStop(0, hexToRgba(color, 0.6));
  gradient.addColorStop(0.5, hexToRgba(color, 0.3));
  gradient.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.8);
  ctx.fill();
}

function drawRipples(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
    const centerX = width / 2;
    const centerY = height / 2;
    // Multiple expanding rings
    for(let i = 0; i < 6; i++) {
        const t = (time * intensity + i * 2) % 10;
        const radius = t * 30;
        const alpha = Math.max(0, 1 - t/10);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(color, alpha);
        ctx.lineWidth = 2 * (1 + intensity);
        ctx.stroke();
    }
}

function drawRhythm(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, time: number, intensity: number) {
    const bars = 32;
    const barWidth = width / bars;
    
    // Simulate audio spectrum visualizer using sine waves + noise
    for(let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const normalizedI = i / bars;
        
        // Create a distinct rhythmic pattern
        const beat = Math.sin(time * 5 * intensity) * 0.5 + 0.5; // Beats per time
        const wave = Math.sin(normalizedI * Math.PI * 2 + time * 2);
        const noise = Math.random() * 0.1;
        
        const barHeight = height * 0.5 * (beat * Math.abs(wave) * intensity + 0.1 + noise);
        const y = height - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, hexToRgba(color, 0.1));
        
        ctx.fillStyle = gradient;
        // Rounded top bars
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 5);
        ctx.fill();
        
        // Mirror reflection
        ctx.fillStyle = hexToRgba(color, 0.1);
        ctx.beginPath();
        ctx.roundRect(x + 2, height, barWidth - 4, barHeight * 0.3, 5);
        ctx.fill();
    }
}
