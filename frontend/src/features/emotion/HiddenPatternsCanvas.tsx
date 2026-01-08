import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface HiddenPatternsCanvasProps {
  color: string;
  onPatternRevealed?: (pattern: string) => void;
}

interface GazePoint {
  x: number;
  y: number;
  duration: number;
}

interface HiddenPattern {
  x: number;
  y: number;
  size: number;
  type: 'love' | 'peace' | 'hope' | 'strength' | 'wisdom';
  revealed: number; // 0-1
  requiredGaze: number; // seconds needed
}

const PATTERN_SYMBOLS: Record<string, string> = {
  love: '❤',
  peace: '☮',
  hope: '✦',
  strength: '◆',
  wisdom: '◇'
};

const PATTERN_MESSAGES: Record<string, string[]> = {
  love: ['you are loved', 'connection', 'warmth within'],
  peace: ['stillness', 'inner calm', 'breathe'],
  hope: ['light ahead', 'tomorrow waits', 'keep going'],
  strength: ['you are enough', 'resilience', 'power within'],
  wisdom: ['trust yourself', 'clarity', 'understanding']
};

export const HiddenPatternsCanvas: React.FC<HiddenPatternsCanvasProps> = ({ 
  color, 
  onPatternRevealed 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [gazePoint, setGazePoint] = useState<GazePoint | null>(null);
  const [patterns, setPatterns] = useState<HiddenPattern[]>([]);
  const [revealedPatterns, setRevealedPatterns] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const gazeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize hidden patterns
  useEffect(() => {
    const types: HiddenPattern['type'][] = ['love', 'peace', 'hope', 'strength', 'wisdom'];
    const newPatterns: HiddenPattern[] = [];
    
    for (let i = 0; i < 5; i++) {
      newPatterns.push({
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        size: 60 + Math.random() * 40,
        type: types[i],
        revealed: 0,
        requiredGaze: 3 + Math.random() * 2 // 3-5 seconds
      });
    }
    
    setPatterns(newPatterns);
  }, []);

  // Track gaze/mouse position
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) / rect.width;
      y = (e.touches[0].clientY - rect.top) / rect.height;
    } else {
      x = (e.clientX - rect.left) / rect.width;
      y = (e.clientY - rect.top) / rect.height;
    }

    setGazePoint(prev => {
      if (prev && Math.abs(prev.x - x) < 0.05 && Math.abs(prev.y - y) < 0.05) {
        return { ...prev, duration: prev.duration + 0.05 };
      }
      return { x, y, duration: 0 };
    });
  }, []);

  // Check for pattern reveals
  useEffect(() => {
    if (!gazePoint) return;

    setPatterns(prev => prev.map(pattern => {
      const dx = pattern.x - gazePoint.x;
      const dy = pattern.y - gazePoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If gazing near the pattern
      if (dist < 0.15) {
        const newRevealed = Math.min(1, pattern.revealed + 0.01);
        
        // Pattern fully revealed
        if (newRevealed >= 1 && pattern.revealed < 1) {
          setRevealedPatterns(prev => [...prev, pattern.type]);
          const messages = PATTERN_MESSAGES[pattern.type];
          setMessage(messages[Math.floor(Math.random() * messages.length)]);
          
          if (onPatternRevealed) {
            onPatternRevealed(pattern.type);
          }
          
          // Clear message after delay
          setTimeout(() => setMessage(''), 5000);
        }
        
        return { ...pattern, revealed: newRevealed };
      }
      
      // Slowly fade if not gazing
      return { ...pattern, revealed: Math.max(0, pattern.revealed - 0.002) };
    }));
  }, [gazePoint, onPatternRevealed]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear
      ctx.fillStyle = 'rgba(10, 5, 25, 0.03)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw decorative background pattern (always visible)
      drawDecorativeLayer(ctx, width, height, color, time);

      // Draw hidden patterns
      patterns.forEach(pattern => {
        drawHiddenPattern(ctx, width, height, pattern, color, time);
      });

      // Draw gaze indicator
      if (gazePoint) {
        const gx = gazePoint.x * width;
        const gy = gazePoint.y * height;
        const gazeSize = 20 + gazePoint.duration * 5;
        
        ctx.beginPath();
        ctx.arc(gx, gy, gazeSize, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba('#fff', 0.1);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [color, patterns, gazePoint]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gazeTimerRef.current) clearInterval(gazeTimerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Message display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-xl text-white/70 font-light">{message}</p>
        </motion.div>
      )}

      {/* Revealed patterns indicator */}
      {revealedPatterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute top-4 left-4 flex gap-2"
        >
          {revealedPatterns.map((type, i) => (
            <span key={i} className="text-2xl">
              {PATTERN_SYMBOLS[type]}
            </span>
          ))}
        </motion.div>
      )}

      {/* Instructions */}
      {revealedPatterns.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/30"
        >
          <p className="text-sm">look closely... something waits to be seen</p>
        </motion.div>
      )}
    </div>
  );
};

// Draw the always-visible decorative layer
function drawDecorativeLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number
) {
  // Organic flowing shapes
  for (let i = 0; i < 15; i++) {
    const x = (Math.sin(i * 1.3 + time * 0.3) * 0.3 + 0.5) * width;
    const y = (Math.cos(i * 0.9 + time * 0.2) * 0.3 + 0.5) * height;
    const size = 40 + Math.sin(time + i) * 20;
    
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.2) {
      const wobble = Math.sin(angle * 3 + time + i) * 10;
      const r = size + wobble;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    ctx.fillStyle = hexToRgba(shiftHue(color, i * 10), 0.05);
    ctx.fill();
  }

  // Subtle grid lines
  ctx.strokeStyle = hexToRgba(color, 0.03);
  ctx.lineWidth = 1;
  
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(time + x * 0.01) * 5, 0);
    ctx.lineTo(x + Math.sin(time + x * 0.01) * 5, height);
    ctx.stroke();
  }
  
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.cos(time + y * 0.01) * 5);
    ctx.lineTo(width, y + Math.cos(time + y * 0.01) * 5);
    ctx.stroke();
  }
}

// Draw a hidden pattern that reveals with gaze
function drawHiddenPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: HiddenPattern,
  color: string,
  time: number
) {
  const x = pattern.x * width;
  const y = pattern.y * height;
  const size = pattern.size;
  const revealed = pattern.revealed;

  // Pre-reveal: subtle disturbance in the decorative layer
  if (revealed < 0.3) {
    const disturbance = revealed / 0.3;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.02 + disturbance * 0.05);
    ctx.fill();
    return;
  }

  // Revealing: shape starts to emerge
  const emergeAmount = (revealed - 0.3) / 0.7;
  
  // Glow effect
  const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * (0.5 + emergeAmount * 0.5));
  glowGradient.addColorStop(0, hexToRgba(color, emergeAmount * 0.4));
  glowGradient.addColorStop(0.5, hexToRgba(color, emergeAmount * 0.2));
  glowGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Draw the pattern symbol
  if (revealed > 0.5) {
    const symbolOpacity = (revealed - 0.5) / 0.5;
    
    switch (pattern.type) {
      case 'love':
        drawHeart(ctx, x, y, size * 0.4 * emergeAmount, color, symbolOpacity);
        break;
      case 'peace':
        drawPeace(ctx, x, y, size * 0.4 * emergeAmount, color, symbolOpacity);
        break;
      case 'hope':
        drawStar(ctx, x, y, size * 0.4 * emergeAmount, color, symbolOpacity);
        break;
      case 'strength':
        drawDiamond(ctx, x, y, size * 0.4 * emergeAmount, color, symbolOpacity);
        break;
      case 'wisdom':
        drawEye(ctx, x, y, size * 0.4 * emergeAmount, color, symbolOpacity);
        break;
    }
  }

  // Particle effect on full reveal
  if (revealed > 0.9) {
    const particleCount = Math.floor((revealed - 0.9) * 100);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const dist = size * (0.5 + Math.sin(time * 2 + i) * 0.2);
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, (revealed - 0.9) * 5);
      ctx.fill();
    }
  }
}

// Shape drawing functions
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
  ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();
  ctx.restore();
}

function drawPeace(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.7, size * 0.7);
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.7, size * 0.7);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.lineTo(Math.cos(nextAngle) * size, Math.sin(nextAngle) * size);
  }
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();
  ctx.restore();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Outer eye
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Iris
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();
  
  // Pupil
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba('#fff', alpha);
  ctx.fill();
  
  ctx.restore();
}

// Helper: Shift hue of a hex color
function shiftHue(hex: string, degrees: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
