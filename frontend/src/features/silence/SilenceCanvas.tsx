import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface SilenceCanvasProps {
  color: string;
  onSilenceStateChange?: (state: 'active' | 'creating' | 'evolved') => void;
}

interface OrganicShape {
  id: number;
  x: number;
  y: number;
  size: number;
  targetSize: number;
  color: string;
  angle: number;
  points: number;
  growthRate: number;
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

export const SilenceCanvas: React.FC<SilenceCanvasProps> = ({ color, onSilenceStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [silenceTime, setSilenceTime] = useState(0);
  const [shapes, setShapes] = useState<OrganicShape[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [evolutionPhase, setEvolutionPhase] = useState<'waiting' | 'growing' | 'connecting' | 'transcending'>('waiting');
  const [autoCreating, setAutoCreating] = useState(false);
  const lastInteractionRef = useRef<number>(Date.now());
  const shapeIdRef = useRef(0);

  // Color palette based on silence duration
  const getSilenceColor = useCallback((baseColor: string, phase: typeof evolutionPhase) => {
    switch (phase) {
      case 'waiting': return baseColor;
      case 'growing': return shiftHue(baseColor, 20);
      case 'connecting': return shiftHue(baseColor, 40);
      case 'transcending': return shiftHue(baseColor, 60);
      default: return baseColor;
    }
  }, []);

  // Track silence duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const silenceDuration = (now - lastInteractionRef.current) / 1000;
      setSilenceTime(silenceDuration);

      // Evolution phases based on silence duration
      if (silenceDuration < 3) {
        setEvolutionPhase('waiting');
        onSilenceStateChange?.('active');
      } else if (silenceDuration < 7) {
        setEvolutionPhase('growing');
        onSilenceStateChange?.('creating');
      } else if (silenceDuration < 15) {
        setEvolutionPhase('connecting');
        onSilenceStateChange?.('creating');
      } else {
        setEvolutionPhase('transcending');
        onSilenceStateChange?.('evolved');
      }

      // Auto-creation after 10 seconds of silence
      if (silenceDuration >= 10 && !autoCreating) {
        setAutoCreating(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [autoCreating, onSilenceStateChange]);

  // Auto-create shapes when silent
  useEffect(() => {
    if (!autoCreating) return;

    const createShape = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const newShape: OrganicShape = {
        id: shapeIdRef.current++,
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: 0,
        targetSize: 30 + Math.random() * 50,
        color: getSilenceColor(color, evolutionPhase),
        angle: Math.random() * Math.PI * 2,
        points: 3 + Math.floor(Math.random() * 5),
        growthRate: 0.5 + Math.random() * 0.5
      };

      setShapes(prev => [...prev.slice(-15), newShape]); // Keep max 16 shapes
    };

    const interval = setInterval(createShape, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [autoCreating, color, evolutionPhase, getSilenceColor]);

  // Create connections between shapes
  useEffect(() => {
    if (evolutionPhase !== 'connecting' && evolutionPhase !== 'transcending') {
      setConnections([]);
      return;
    }

    const newConnections: Connection[] = [];
    shapes.forEach((shape, i) => {
      shapes.slice(i + 1).forEach((other) => {
        const dx = shape.x - other.x;
        const dy = shape.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          newConnections.push({
            from: shape.id,
            to: other.id,
            strength: 1 - distance / 200
          });
        }
      });
    });
    setConnections(newConnections);
  }, [shapes, evolutionPhase]);

  // Handle any interaction (resets silence)
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setAutoCreating(false);
    setSilenceTime(0);
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
    window.addEventListener('resize', updateSize);

    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Fade effect for trailing
      ctx.fillStyle = 'rgba(10, 5, 25, 0.05)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw ambient silence visualization
      drawSilenceAmbient(ctx, width, height, color, time, evolutionPhase, silenceTime);

      // Draw connections first (behind shapes)
      connections.forEach(conn => {
        const fromShape = shapes.find(s => s.id === conn.from);
        const toShape = shapes.find(s => s.id === conn.to);
        if (!fromShape || !toShape) return;

        ctx.beginPath();
        ctx.moveTo(fromShape.x, fromShape.y);
        
        // Curved connection
        const midX = (fromShape.x + toShape.x) / 2 + Math.sin(time * 2) * 20;
        const midY = (fromShape.y + toShape.y) / 2 + Math.cos(time * 2) * 20;
        ctx.quadraticCurveTo(midX, midY, toShape.x, toShape.y);
        
        ctx.strokeStyle = hexToRgba(color, conn.strength * 0.5);
        ctx.lineWidth = conn.strength * 3;
        ctx.stroke();
      });

      // Draw and animate shapes
      setShapes(prev => prev.map(shape => {
        // Grow towards target
        const newSize = shape.size + (shape.targetSize - shape.size) * 0.02 * shape.growthRate;
        
        // Gentle floating motion
        const floatX = Math.sin(time + shape.id) * 0.5;
        const floatY = Math.cos(time * 0.7 + shape.id) * 0.5;
        
        const updatedShape = {
          ...shape,
          size: newSize,
          x: shape.x + floatX,
          y: shape.y + floatY,
          angle: shape.angle + 0.002
        };

        // Draw the shape
        drawOrganicShape(ctx, updatedShape, time);

        return updatedShape;
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [color, connections, evolutionPhase, silenceTime]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-default"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Silence Timer Display */}
      <motion.div
        className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: silenceTime > 2 ? 1 : 0.3 }}
      >
        <div className="text-2xl font-light text-white/80">
          {formatTime(silenceTime)}
        </div>
        <div className="text-xs text-white/40 uppercase tracking-wider">Silence</div>
      </motion.div>

      {/* Evolution Phase Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={evolutionPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg"
        >
          <span className="text-sm text-white/70 capitalize">
            {evolutionPhase === 'waiting' && '🌙 Waiting...'}
            {evolutionPhase === 'growing' && '🌱 Growing...'}
            {evolutionPhase === 'connecting' && '🔗 Connecting...'}
            {evolutionPhase === 'transcending' && '✨ Transcending'}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Silence Prompt */}
      <AnimatePresence>
        {silenceTime < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center text-white/30">
              <motion.p
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-lg"
              >
                Be still. Let silence speak.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Creation Indicator */}
      <AnimatePresence>
        {autoCreating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <span className="text-sm text-white/60">
              🎨 Mind creating without words...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
}

// Helper function to shift hue
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

// Draw organic blob-like shape
function drawOrganicShape(ctx: CanvasRenderingContext2D, shape: OrganicShape, time: number) {
  const { x, y, size, color, angle, points } = shape;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.beginPath();
  for (let i = 0; i <= points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2;
    const wobble = Math.sin(time * 2 + i + shape.id) * 0.2;
    const r = size * (1 + wobble);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, hexToRgba(color, 0.8));
  gradient.addColorStop(0.7, hexToRgba(color, 0.4));
  gradient.addColorStop(1, hexToRgba(color, 0));
  
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

// Draw ambient silence visualization
function drawSilenceAmbient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  phase: 'waiting' | 'growing' | 'connecting' | 'transcending',
  silenceTime: number
) {
  const intensity = Math.min(1, silenceTime / 30);
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Breathing pulse rings - expand outward from center
  const pulseCount = Math.floor(silenceTime / 3);
  for (let i = 0; i < Math.min(pulseCount, 8); i++) {
    const pulseProgress = ((time * 0.3 + i * 0.5) % 1);
    const pulseSize = pulseProgress * Math.min(width, height) * 0.6;
    const pulseAlpha = (1 - pulseProgress) * 0.15 * intensity;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(shiftHue(color, i * 15), pulseAlpha);
    ctx.lineWidth = 2 + (1 - pulseProgress) * 3;
    ctx.stroke();
  }

  // 2. Floating orbs that appear with silence
  const orbCount = Math.min(Math.floor(silenceTime / 2), 12);
  for (let i = 0; i < orbCount; i++) {
    const angle = (i / orbCount) * Math.PI * 2 + time * 0.1;
    const distance = 80 + Math.sin(time * 0.5 + i) * 30 + silenceTime * 3;
    const orbX = centerX + Math.cos(angle) * distance;
    const orbY = centerY + Math.sin(angle) * distance;
    const orbSize = 8 + Math.sin(time + i * 2) * 4;
    
    const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 2);
    orbGradient.addColorStop(0, hexToRgba(shiftHue(color, i * 25), 0.6));
    orbGradient.addColorStop(0.5, hexToRgba(shiftHue(color, i * 25), 0.2));
    orbGradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbSize * 2, 0, Math.PI * 2);
    ctx.fillStyle = orbGradient;
    ctx.fill();
  }

  // 3. Central breathing core
  const breathSize = 50 + Math.sin(time * 0.5) * 20 * intensity + silenceTime * 1.5;
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, breathSize * 3
  );
  coreGradient.addColorStop(0, hexToRgba(color, 0.2 * intensity));
  coreGradient.addColorStop(0.3, hexToRgba(color, 0.1 * intensity));
  coreGradient.addColorStop(0.6, hexToRgba(shiftHue(color, 30), 0.05 * intensity));
  coreGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, breathSize * 3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Flowing light streams
  if (phase === 'growing' || phase === 'connecting' || phase === 'transcending') {
    const streamCount = phase === 'transcending' ? 8 : phase === 'connecting' ? 5 : 3;
    for (let i = 0; i < streamCount; i++) {
      const startAngle = (i / streamCount) * Math.PI * 2 + time * 0.2;
      const streamLength = 100 + silenceTime * 5;
      
      ctx.beginPath();
      for (let j = 0; j < 50; j++) {
        const t = j / 50;
        const angle = startAngle + t * 0.5 + Math.sin(time + i) * 0.3;
        const dist = t * streamLength;
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(shiftHue(color, i * 40), 0.1 + intensity * 0.2);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 5. Particle nebula for connecting/transcending
  if (phase === 'connecting' || phase === 'transcending') {
    const particleCount = phase === 'transcending' ? 60 : 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 0.05;
      const wave = Math.sin(time * 0.5 + i * 0.2) * 50;
      const baseRadius = 150 + silenceTime * 2;
      const px = centerX + Math.cos(angle) * (baseRadius + wave);
      const py = centerY + Math.sin(angle) * (baseRadius + wave);
      const pSize = 1 + Math.sin(time * 2 + i) * 1;
      
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(shiftHue(color, i * 6), 0.4 + Math.sin(time + i) * 0.2);
      ctx.fill();
    }
  }

  // 6. Sacred geometry hints in transcending
  if (phase === 'transcending' && silenceTime > 20) {
    const geoAlpha = Math.min((silenceTime - 20) / 30, 0.3);
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 180 + Math.sin(time) * 10, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba('#ffffff', geoAlpha * 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Inner triangles (flower of life hint)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.05;
      const x1 = centerX + Math.cos(angle) * 100;
      const y1 = centerY + Math.sin(angle) * 100;
      const x2 = centerX + Math.cos(angle + Math.PI * 2 / 3) * 100;
      const y2 = centerY + Math.sin(angle + Math.PI * 2 / 3) * 100;
      const x3 = centerX + Math.cos(angle - Math.PI * 2 / 3) * 100;
      const y3 = centerY + Math.sin(angle - Math.PI * 2 / 3) * 100;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.strokeStyle = hexToRgba(color, geoAlpha * 0.2);
      ctx.stroke();
    }
    
    // Hexagon
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const x = centerX + Math.cos(angle) * 120;
      const y = centerY + Math.sin(angle) * 120;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = hexToRgba('#ffffff', geoAlpha * 0.2);
    ctx.stroke();
  }

  // 7. Ambient floating dust particles
  const dustCount = Math.floor(20 + silenceTime * 2);
  for (let i = 0; i < Math.min(dustCount, 80); i++) {
    const px = ((Math.sin(time * 0.2 + i * 0.7) + 1) / 2) * width;
    const py = ((Math.cos(time * 0.15 + i * 0.5) + 1) / 2) * height;
    const pSize = 0.5 + Math.random() * 1.5;
    const pAlpha = 0.1 + Math.sin(time + i) * 0.05;
    
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba('#ffffff', pAlpha);
    ctx.fill();
  }

  // 8. Aurora waves at edges during transcending
  if (phase === 'transcending') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const waveY = height * 0.1 + i * 30 + 
                      Math.sin(x * 0.01 + time + i) * 30 +
                      Math.sin(x * 0.02 + time * 0.5) * 15;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      
      const auroraGradient = ctx.createLinearGradient(0, 0, width, 0);
      auroraGradient.addColorStop(0, hexToRgba(shiftHue(color, i * 30), 0));
      auroraGradient.addColorStop(0.3, hexToRgba(shiftHue(color, i * 30), 0.15));
      auroraGradient.addColorStop(0.7, hexToRgba(shiftHue(color, i * 30 + 60), 0.15));
      auroraGradient.addColorStop(1, hexToRgba(shiftHue(color, i * 30 + 60), 0));
      
      ctx.strokeStyle = auroraGradient;
      ctx.lineWidth = 20;
      ctx.stroke();
    }
  }
}
