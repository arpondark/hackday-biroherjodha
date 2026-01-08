import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface ExperimentalCanvasProps {
  color: string;
  mode: 'drift' | 'dialogue' | 'misinterpret' | 'stillness' | 'nocenter' | 'echo';
}

// Color palette for emotion drift
const emotionColors = {
  joy: '#F5A623',
  sadness: '#7B68EE',
  calm: '#4A90E2',
  anger: '#E74C3C',
  fear: '#9B59B6',
  love: '#E91E63',
  peace: '#2ECC71',
};

interface DriftingEmotion {
  color: string;
  targetColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

interface DialogueEntity {
  x: number;
  y: number;
  color: string;
  size: number;
  pulse: number;
  tension: number;
}

interface EchoTrace {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  timestamp: number;
}

export const ExperimentalCanvas: React.FC<ExperimentalCanvasProps> = ({ color, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [stillnessTime, setStillnessTime] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [echoTraces, setEchoTraces] = useState<EchoTrace[]>([]);
  const entitiesRef = useRef<DialogueEntity[]>([]);
  const driftingRef = useRef<DriftingEmotion[]>([]);

  // Initialize entities for dialogue mode
  useEffect(() => {
    if (mode === 'dialogue') {
      entitiesRef.current = [
        { x: 0.3, y: 0.5, color: color, size: 50, pulse: 0, tension: 0.5 },
        { x: 0.7, y: 0.5, color: shiftHue(color, 180), size: 50, pulse: Math.PI, tension: 0.5 }
      ];
    }
  }, [mode, color]);

  // Initialize drifting emotions
  useEffect(() => {
    if (mode === 'drift') {
      const colors = Object.values(emotionColors);
      driftingRef.current = colors.slice(0, 5).map((c, i) => ({
        color: c,
        targetColor: colors[(i + 1) % colors.length],
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        size: 30 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2
      }));
    }
  }, [mode]);

  // Track stillness
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setStillnessTime((now - lastInteraction) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [lastInteraction]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const wasStill = Date.now() - lastInteraction > 2000;
    
    // Create echo trace when breaking stillness
    if (wasStill && mode === 'echo') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        let x: number, y: number;
        if ('touches' in e) {
          x = (e.touches[0].clientX - rect.left) / rect.width;
          y = (e.touches[0].clientY - rect.top) / rect.height;
        } else {
          x = (e.clientX - rect.left) / rect.width;
          y = (e.clientY - rect.top) / rect.height;
        }
        
        setEchoTraces(prev => [...prev, {
          x, y,
          size: 20 + stillnessTime * 5,
          alpha: 0.8,
          color: color,
          timestamp: now
        }]);
      }
    }
    
    setLastInteraction(now);
  }, [lastInteraction, mode, color, stillnessTime]);

  // Decay echo traces
  useEffect(() => {
    if (mode !== 'echo') return;
    
    const interval = setInterval(() => {
      setEchoTraces(prev => 
        prev
          .map(trace => ({ ...trace, alpha: trace.alpha * 0.995 }))
          .filter(trace => trace.alpha > 0.01)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [mode]);

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
    const randomSeed = Math.random() * 1000;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear
      ctx.fillStyle = 'rgba(10, 5, 25, 0.05)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      switch (mode) {
        case 'drift':
          drawEmotionDrift(ctx, width, height, time, driftingRef.current);
          break;
        case 'dialogue':
          drawUnspokenDialogue(ctx, width, height, time, entitiesRef.current, stillnessTime);
          break;
        case 'misinterpret':
          drawMisinterpretation(ctx, width, height, color, time, randomSeed);
          break;
        case 'stillness':
          drawStillnessReward(ctx, width, height, color, time, stillnessTime);
          break;
        case 'nocenter':
          drawNoCenter(ctx, width, height, color, time);
          break;
        case 'echo':
          drawSilenceEcho(ctx, width, height, echoTraces, time);
          break;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mode, color, stillnessTime, echoTraces]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-none"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Mode-specific UI */}
      {mode === 'stillness' && stillnessTime > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute top-4 left-4 text-xs text-white/30"
        >
          stillness: {Math.floor(stillnessTime)}s
        </motion.div>
      )}

      {mode === 'echo' && echoTraces.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute bottom-4 right-4 text-xs text-white/20"
        >
          {echoTraces.length} memories
        </motion.div>
      )}
    </div>
  );
};

// Emotion Drift - emotions slowly morph into each other
function drawEmotionDrift(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  emotions: DriftingEmotion[]
) {
  emotions.forEach((emotion, i) => {
    // Update position with drift
    emotion.x += emotion.vx;
    emotion.y += emotion.vy;
    
    // Bounce off edges softly
    if (emotion.x < 0.1 || emotion.x > 0.9) emotion.vx *= -0.8;
    if (emotion.y < 0.1 || emotion.y > 0.9) emotion.vy *= -0.8;
    
    // Slowly shift color towards target
    emotion.color = lerpColor(emotion.color, emotion.targetColor, 0.001);
    
    // Occasionally change target
    if (Math.random() < 0.001) {
      const colors = Object.values(emotionColors);
      emotion.targetColor = colors[Math.floor(Math.random() * colors.length)];
    }

    const x = emotion.x * width;
    const y = emotion.y * height;
    const size = emotion.size + Math.sin(time + emotion.phase) * 10;

    // Draw amorphous shape
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const wobble = Math.sin(angle * 3 + time + i) * 10 + 
                     Math.sin(angle * 5 + time * 0.7) * 5;
      const r = size + wobble;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    gradient.addColorStop(0, hexToRgba(emotion.color, 0.6));
    gradient.addColorStop(0.5, hexToRgba(emotion.color, 0.3));
    gradient.addColorStop(1, hexToRgba(emotion.color, 0));
    
    ctx.fillStyle = gradient;
    ctx.fill();
  });

  // Draw connections between nearby emotions
  for (let i = 0; i < emotions.length; i++) {
    for (let j = i + 1; j < emotions.length; j++) {
      const dx = (emotions[i].x - emotions[j].x) * width;
      const dy = (emotions[i].y - emotions[j].y) * height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) {
        const alpha = (1 - dist / 200) * 0.3;
        ctx.beginPath();
        ctx.moveTo(emotions[i].x * width, emotions[i].y * height);
        ctx.lineTo(emotions[j].x * width, emotions[j].y * height);
        ctx.strokeStyle = hexToRgba(emotions[i].color, alpha);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
}

// Unspoken Dialogue - two entities communicate through distance and tension
function drawUnspokenDialogue(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  entities: DialogueEntity[],
  stillnessTime: number
) {
  if (entities.length < 2) return;

  const [a, b] = entities;
  
  // Update tension based on distance
  const dx = (a.x - b.x) * width;
  const dy = (a.y - b.y) * height;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const tension = Math.max(0, 1 - distance / 400);

  // Entities slowly approach or retreat based on stillness
  const attraction = stillnessTime > 5 ? 0.0001 : -0.00005;
  const dirX = (b.x - a.x);
  const dirY = (b.y - a.y);
  
  a.x += dirX * attraction;
  a.y += dirY * attraction;
  b.x -= dirX * attraction;
  b.y -= dirY * attraction;

  // Draw entities
  [a, b].forEach((entity) => {
    const x = entity.x * width;
    const y = entity.y * height;
    const pulseSize = entity.size + Math.sin(time * 2 + entity.pulse) * (10 + tension * 20);

    // Main body
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const wobble = Math.sin(angle * 4 + time * 3) * (5 + tension * 15);
      const r = pulseSize + wobble;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 1.5);
    gradient.addColorStop(0, hexToRgba(entity.color, 0.7));
    gradient.addColorStop(0.6, hexToRgba(entity.color, 0.3));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fill();
  });

  // Draw tension field between entities
  const midX = (a.x + b.x) / 2 * width;
  const midY = (a.y + b.y) / 2 * height;
  
  ctx.beginPath();
  ctx.moveTo(a.x * width, a.y * height);
  
  // Curved tension line
  const curveOffset = Math.sin(time * 2) * 50 * tension;
  ctx.quadraticCurveTo(
    midX + curveOffset, midY - curveOffset,
    b.x * width, b.y * height
  );
  
  ctx.strokeStyle = hexToRgba(lerpColor(a.color, b.color, 0.5), tension * 0.5);
  ctx.lineWidth = 2 + tension * 3;
  ctx.stroke();

  // Tension particles
  if (tension > 0.3) {
    for (let i = 0; i < 5; i++) {
      const t = (time * 0.5 + i * 0.2) % 1;
      const px = a.x * width + (b.x * width - a.x * width) * t;
      const py = a.y * height + (b.y * height - a.y * height) * t + 
                 Math.sin(t * Math.PI) * curveOffset;
      
      ctx.beginPath();
      ctx.arc(px, py, 3 * tension, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba('#fff', tension * 0.5);
      ctx.fill();
    }
  }
}

// Pattern Misinterpretation - same pattern feels different each time
function drawMisinterpretation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  seed: number
) {
  const gridSize = 8;
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i * cellWidth + cellWidth / 2;
      const y = j * cellHeight + cellHeight / 2;
      
      // Pseudo-random variation based on seed, position, and time
      const noise = Math.sin(seed + i * 13.37 + j * 7.89 + time * 0.1) * 0.5 + 0.5;
      const noise2 = Math.cos(seed * 2 + i * 5.67 + j * 11.23 + time * 0.15) * 0.5 + 0.5;
      
      const size = 10 + noise * 30;
      const rotation = noise2 * Math.PI * 2 + time * 0.1;
      const alpha = 0.3 + noise * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Draw shape that could be interpreted different ways
      ctx.beginPath();
      const points = 3 + Math.floor(noise * 3);
      for (let k = 0; k <= points; k++) {
        const angle = (k / points) * Math.PI * 2;
        const r = size * (0.8 + Math.sin(angle * 2 + seed) * 0.2);
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      ctx.fillStyle = hexToRgba(shiftHue(color, noise * 60 - 30), alpha);
      ctx.fill();
      
      ctx.restore();
    }
  }
}

// Stillness Reward - new visuals appear only during complete inactivity
function drawStillnessReward(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  stillnessTime: number
) {
  // Base ambient - always present
  const ambientAlpha = 0.1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      width / 2 + Math.sin(time * 0.3 + i) * 50,
      height / 2 + Math.cos(time * 0.2 + i) * 50,
      100 + i * 30,
      0, Math.PI * 2
    );
    ctx.fillStyle = hexToRgba(color, ambientAlpha);
    ctx.fill();
  }

  // Stillness rewards - appear after inactivity
  if (stillnessTime > 3) {
    const rewardIntensity = Math.min(1, (stillnessTime - 3) / 10);
    
    // Emerging forms
    const forms = Math.floor(stillnessTime / 5);
    for (let i = 0; i < forms; i++) {
      const angle = (i / forms) * Math.PI * 2 + time * 0.1;
      const distance = 80 + i * 30;
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;
      const size = 20 + stillnessTime * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, hexToRgba(shiftHue(color, i * 30), 0.6 * rewardIntensity));
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Central revelation
    if (stillnessTime > 10) {
      const revelationAlpha = Math.min(0.8, (stillnessTime - 10) / 20);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 30 + stillnessTime, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba('#fff', revelationAlpha * 0.3);
      ctx.fill();
    }
  }

  // Stillness indicator
  if (stillnessTime > 2) {
    ctx.fillStyle = hexToRgba('#fff', 0.1);
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('be still...', width / 2, height - 30);
  }
}

// No Center - emotion without focal point
function drawNoCenter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number
) {
  // Distributed presence across entire canvas
  const points = 50;
  
  for (let i = 0; i < points; i++) {
    // Evenly distributed but organically moving
    const baseX = (i % 10) / 10;
    const baseY = Math.floor(i / 10) / 5;
    
    const x = (baseX + Math.sin(time + i * 0.5) * 0.05) * width;
    const y = (baseY + Math.cos(time * 0.7 + i * 0.3) * 0.05) * height;
    
    const size = 30 + Math.sin(time + i) * 10;
    const alpha = 0.2 + Math.sin(time * 0.5 + i * 0.7) * 0.1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, hexToRgba(shiftHue(color, i * 7), alpha));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Connecting tissue - no hierarchy
  ctx.strokeStyle = hexToRgba(color, 0.05);
  ctx.lineWidth = 1;
  
  for (let x = 0; x < width; x += 20) {
    ctx.beginPath();
    for (let y = 0; y < height; y += 5) {
      const offsetX = Math.sin(y * 0.02 + time + x * 0.01) * 10;
      if (y === 0) ctx.moveTo(x + offsetX, y);
      else ctx.lineTo(x + offsetX, y);
    }
    ctx.stroke();
  }
}

// Silence Echo - visual afterimage when sound stops
function drawSilenceEcho(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  traces: EchoTrace[],
  time: number
) {
  // Ambient silence
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, 'rgba(20, 10, 40, 0.02)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw echo traces - memories of interaction
  traces.forEach((trace) => {
    const x = trace.x * width;
    const y = trace.y * height;
    const age = (Date.now() - trace.timestamp) / 1000;
    const expandedSize = trace.size + age * 10;
    
    // Outer ring - fading
    ctx.beginPath();
    ctx.arc(x, y, expandedSize, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(trace.color, trace.alpha * 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner glow
    const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, expandedSize * 0.5);
    innerGradient.addColorStop(0, hexToRgba(trace.color, trace.alpha * 0.3));
    innerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Ripple effect
    for (let r = 1; r <= 3; r++) {
      const rippleSize = expandedSize + r * 20 + Math.sin(time * 2 + r) * 5;
      const rippleAlpha = trace.alpha * 0.1 / r;
      
      ctx.beginPath();
      ctx.arc(x, y, rippleSize, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(trace.color, rippleAlpha);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  // Instructions when empty
  if (traces.length === 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('be still, then move', width / 2, height / 2);
    ctx.fillText('silence leaves traces', width / 2, height / 2 + 20);
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

// Helper: Lerp between two colors
function lerpColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
