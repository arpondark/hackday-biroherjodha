import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface SilenceZonesCanvasProps {
  color: string;
  onZoneEntered?: (zoneId: number) => void;
}

interface SilenceZone {
  id: number;
  x: number;
  y: number;
  radius: number;
  depth: number; // How deep user has gone
  maxDepth: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const SilenceZonesCanvas: React.FC<SilenceZonesCanvasProps> = ({ 
  color, 
  onZoneEntered 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number>(1);
  
  const [zones, setZones] = useState<SilenceZone[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [inSilence, setInSilence] = useState(false);
  const [silenceDepth, setSilenceDepth] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize zones
  useEffect(() => {
    const newZones: SilenceZone[] = [];
    const zoneCount = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < zoneCount; i++) {
      newZones.push({
        id: i,
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        radius: 0.1 + Math.random() * 0.1,
        depth: 0,
        maxDepth: 0,
        color: shiftHue(color, i * 40)
      });
    }
    
    setZones(newZones);
  }, [color]);

  // Initialize ambient sound
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;

    return () => {
      osc.stop();
      ctx.close();
    };
  }, []);

  // Update sound based on silence depth
  useEffect(() => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    const osc = oscillatorRef.current;
    
    if (!ctx || !gain || !osc) return;

    // Sound fades as user enters silence zones
    const volume = Math.max(0, 0.1 - silenceDepth * 0.1);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    
    // Frequency drops in silence
    const freq = 100 - silenceDepth * 50;
    osc.frequency.linearRampToValueAtTime(Math.max(20, freq), ctx.currentTime + 0.1);
  }, [silenceDepth]);

  // Handle mouse movement
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

    setMousePos({ x, y });

    // Check if in any silence zone
    let deepestDepth = 0;
    let inAnyZone = false;

    zones.forEach(zone => {
      const dx = zone.x - x;
      const dy = zone.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < zone.radius) {
        inAnyZone = true;
        const depth = 1 - dist / zone.radius;
        if (depth > deepestDepth) {
          deepestDepth = depth;
        }
        
        if (depth > zone.maxDepth) {
          zone.maxDepth = depth;
          if (onZoneEntered && depth > 0.8) {
            onZoneEntered(zone.id);
          }
        }
      }
    });

    setInSilence(inAnyZone);
    setSilenceDepth(deepestDepth);

    // Create particles when entering silence
    if (inAnyZone && Math.random() < silenceDepth * 0.3) {
      setParticles(prev => [...prev, {
        x: x * canvas.offsetWidth,
        y: y * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 2 + Math.random() * 4,
        alpha: silenceDepth,
        color: color
      }].slice(-50));
    }
  }, [zones, color, onZoneEntered, silenceDepth]);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          alpha: p.alpha * 0.98,
          size: p.size * 0.99
        }))
        .filter(p => p.alpha > 0.01)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

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

      // Clear with fade
      ctx.fillStyle = 'rgba(10, 5, 25, 0.05)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw ambient noise (louder outside zones)
      const noiseIntensity = 1 - silenceDepth;
      drawAmbientNoise(ctx, width, height, color, time, noiseIntensity);

      // Draw silence zones
      zones.forEach(zone => {
        drawSilenceZone(ctx, width, height, zone, mousePos, time);
      });

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.color, p.alpha * 0.5);
        ctx.fill();
      });

      // Draw cursor effect
      const cx = mousePos.x * width;
      const cy = mousePos.y * height;
      
      if (inSilence) {
        // Sharper, deeper visuals in silence
        const depth = silenceDepth;
        
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + depth * 20, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(color, 0.3 + depth * 0.4);
        ctx.lineWidth = 2 + depth * 2;
        ctx.stroke();

        // Inner glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + depth * 20);
        gradient.addColorStop(0, hexToRgba(color, depth * 0.3));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Silence depth indicator
      if (silenceDepth > 0.1) {
        ctx.fillStyle = hexToRgba('#fff', silenceDepth * 0.3);
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`silence: ${Math.floor(silenceDepth * 100)}%`, cx, cy + 60);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [color, zones, mousePos, inSilence, silenceDepth, particles]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: inSilence ? 0 : 0.4 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/40"
      >
        <p className="text-sm">approach the quiet zones</p>
        <p className="text-xs mt-1">sound disappears as you enter</p>
      </motion.div>

      {/* Deep silence message */}
      {silenceDepth > 0.8 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        >
          <p className="text-2xl text-white/30 font-light">deep silence</p>
        </motion.div>
      )}
    </div>
  );
};

// Draw ambient noise that fades in silence zones
function drawAmbientNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  // Random noise particles
  for (let i = 0; i < intensity * 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, intensity * 0.1 * Math.random());
    ctx.fill();
  }

  // Wave lines representing ambient sound
  ctx.strokeStyle = hexToRgba(color, intensity * 0.1);
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = 0; x < width; x += 5) {
      const amplitude = 20 * intensity;
      const y = height / 2 + i * 30 - 60 + 
                Math.sin(x * 0.02 + time * 3 + i) * amplitude +
                Math.sin(x * 0.05 + time * 2) * amplitude * 0.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// Draw individual silence zone
function drawSilenceZone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zone: SilenceZone,
  mousePos: { x: number; y: number },
  time: number
) {
  const x = zone.x * width;
  const y = zone.y * height;
  const radius = zone.radius * Math.min(width, height);
  
  const dx = zone.x - mousePos.x;
  const dy = zone.y - mousePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const proximity = Math.max(0, 1 - dist / (zone.radius * 2));

  // Outer boundary - pulsing
  const pulseSize = radius + Math.sin(time * 2) * 5;
  
  ctx.beginPath();
  ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(zone.color, 0.1 + proximity * 0.2);
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner gradient - deepens when entered
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  
  if (proximity > 0.5) {
    // Deep silence visualization
    gradient.addColorStop(0, hexToRgba(zone.color, proximity * 0.4));
    gradient.addColorStop(0.3, hexToRgba(zone.color, proximity * 0.3));
    gradient.addColorStop(0.6, hexToRgba(zone.color, proximity * 0.15));
    gradient.addColorStop(1, 'transparent');
  } else {
    // Subtle presence
    gradient.addColorStop(0, hexToRgba(zone.color, 0.1));
    gradient.addColorStop(0.5, hexToRgba(zone.color, 0.05));
    gradient.addColorStop(1, 'transparent');
  }
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Concentric rings when approaching
  if (proximity > 0.3) {
    for (let i = 1; i <= 3; i++) {
      const ringRadius = radius * (i / 4);
      const ringAlpha = (proximity - 0.3) * 0.3 / i;
      
      ctx.beginPath();
      ctx.arc(x, y, ringRadius + Math.sin(time * 2 + i) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(zone.color, ringAlpha);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Max depth marker
  if (zone.maxDepth > 0.5) {
    const markerSize = 5 + zone.maxDepth * 5;
    ctx.beginPath();
    ctx.arc(x, y, markerSize, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba('#fff', zone.maxDepth * 0.3);
    ctx.fill();
  }
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
