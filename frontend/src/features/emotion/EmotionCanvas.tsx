import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PatternType } from '@/utils/emotions';
import { hexToRgba } from '@/utils/emotions';

interface EmotionCanvasProps {
  color: string;
  pattern: PatternType;
  motionIntensity: number;
  interactive?: boolean;
}

export const EmotionCanvas: React.FC<EmotionCanvasProps> = ({
  color,
  pattern,
  motionIntensity,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    let time = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * motionIntensity,
        vy: (Math.random() - 0.5) * motionIntensity,
        size: Math.random() * 4 + 2,
      });
    }

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);
      time += 0.01 * motionIntensity;

      // Draw based on pattern
      switch (pattern) {
        case 'waves':
          drawWaves(ctx, width, height, color, time, motionIntensity);
          break;
        case 'circles':
          drawCircles(ctx, width, height, color, time, motionIntensity);
          break;
        case 'spirals':
          drawSpirals(ctx, width, height, color, time, motionIntensity);
          break;
        case 'particles':
          drawParticles(ctx, width, height, color, particles, motionIntensity);
          break;
        case 'flow':
          drawFlow(ctx, width, height, color, time, motionIntensity);
          break;
        case 'pulse':
          drawPulse(ctx, width, height, color, time, motionIntensity);
          break;
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
  }, [color, pattern, motionIntensity]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
};

// Pattern drawing functions
function drawWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  const waves = 5;
  for (let i = 0; i < waves; i++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.3 - i * 0.05);
    ctx.lineWidth = 3;

    for (let x = 0; x < width; x += 5) {
      const y =
        height / 2 +
        Math.sin(x * 0.01 + time + i * 0.5) * 50 * intensity +
        Math.sin(x * 0.02 + time * 0.5) * 30 * intensity;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function drawCircles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const circles = 8;

  for (let i = 0; i < circles; i++) {
    const radius = (i * 40 + time * 20 * intensity) % (Math.max(width, height) / 2);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(color, 0.4 - (radius / Math.max(width, height)) * 0.4);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawSpirals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
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

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }>,
  intensity: number
) {
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.6);
    ctx.fill();

    // Draw connections
    particles.forEach((other) => {
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

function drawFlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  const lines = 20;
  for (let i = 0; i < lines; i++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.3);
    ctx.lineWidth = 2;

    const startY = (height / lines) * i;
    for (let x = 0; x < width; x += 10) {
      const y = startY + Math.sin(x * 0.02 + time + i * 0.2) * 20 * intensity;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const pulseSize = Math.abs(Math.sin(time * intensity)) * 100 + 50;

  // Outer glow
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 2);
  gradient.addColorStop(0, hexToRgba(color, 0.6));
  gradient.addColorStop(0.5, hexToRgba(color, 0.3));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.8);
  ctx.fill();
}
