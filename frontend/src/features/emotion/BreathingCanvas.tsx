import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface BreathingCanvasProps {
  color: string;
  emotionType?: 'calm' | 'anxiety' | 'joy' | 'sadness' | 'anger' | 'peace';
  onBreathCycle?: (phase: 'inhale' | 'hold' | 'exhale') => void;
}

// Breathing patterns for different emotions
const breathingPatterns = {
  calm: { inhale: 4000, hold: 2000, exhale: 6000, variance: 0.05 },
  anxiety: { inhale: 1500, hold: 300, exhale: 1200, variance: 0.3 },
  joy: { inhale: 2500, hold: 1000, exhale: 2500, variance: 0.1 },
  sadness: { inhale: 3500, hold: 3000, exhale: 5000, variance: 0.08 },
  anger: { inhale: 1000, hold: 500, exhale: 800, variance: 0.4 },
  peace: { inhale: 5000, hold: 3000, exhale: 7000, variance: 0.02 },
};

export const BreathingCanvas: React.FC<BreathingCanvasProps> = ({
  color,
  emotionType = 'calm',
  onBreathCycle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [, setBreathProgress] = useState(0);
  const phaseStartRef = useRef(Date.now());
  const currentPhaseRef = useRef<'inhale' | 'hold' | 'exhale'>('inhale');

  const pattern = breathingPatterns[emotionType];

  // Get current phase duration with variance
  const getPhaseDuration = useCallback((phase: 'inhale' | 'hold' | 'exhale') => {
    const base = pattern[phase];
    const variance = pattern.variance;
    return base * (1 + (Math.random() - 0.5) * variance * 2);
  }, [pattern]);

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

    let currentPhaseDuration = getPhaseDuration('inhale');
    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const now = Date.now();
      const elapsed = now - phaseStartRef.current;
      const progress = Math.min(1, elapsed / currentPhaseDuration);

      setBreathProgress(progress);
      time += 0.01;

      // Clear with fade
      ctx.fillStyle = 'rgba(10, 5, 25, 0.03)';
      ctx.fillRect(0, 0, width, height);

      // Calculate breath size based on phase
      let breathSize: number;
      const baseSize = Math.min(width, height) * 0.15;
      const maxSize = Math.min(width, height) * 0.4;

      switch (currentPhaseRef.current) {
        case 'inhale':
          breathSize = baseSize + (maxSize - baseSize) * easeInOutSine(progress);
          break;
        case 'hold':
          breathSize = maxSize + Math.sin(time * 2) * 5; // Slight tremor
          break;
        case 'exhale':
          breathSize = maxSize - (maxSize - baseSize) * easeInOutSine(progress);
          break;
        default:
          breathSize = baseSize;
      }

      // Draw breathing visualization
      drawBreathingCircle(ctx, width, height, color, breathSize, time, emotionType);
      
      // Draw peripheral waves
      drawPeripheralWaves(ctx, width, height, color, breathSize, time, emotionType);

      // Phase transition
      if (progress >= 1) {
        const phases: ('inhale' | 'hold' | 'exhale')[] = ['inhale', 'hold', 'exhale'];
        const currentIndex = phases.indexOf(currentPhaseRef.current);
        const nextPhase = phases[(currentIndex + 1) % 3];
        
        currentPhaseRef.current = nextPhase;
        setBreathPhase(nextPhase);
        phaseStartRef.current = now;
        currentPhaseDuration = getPhaseDuration(nextPhase);
        onBreathCycle?.(nextPhase);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [color, emotionType, getPhaseDuration, onBreathCycle]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Breath Phase Indicator - Subtle, non-intrusive */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
      >
        <div className="flex items-center gap-3">
          {['inhale', 'hold', 'exhale'].map((phase) => (
            <motion.div
              key={phase}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: breathPhase === phase ? color : 'rgba(255,255,255,0.2)',
                scale: breathPhase === phase ? 1.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Emotion type indicator */}
      <motion.div
        className="absolute top-4 right-4 text-xs text-white/20 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {emotionType}
      </motion.div>
    </div>
  );
};

// Easing function
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Draw the main breathing circle
function drawBreathingCircle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  size: number,
  time: number,
  emotionType: string
) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Multiple layered circles for depth
  for (let i = 5; i >= 0; i--) {
    const layerSize = size * (1 + i * 0.15);
    const alpha = 0.15 - i * 0.02;
    
    // Add distortion based on emotion
    const distortion = emotionType === 'anxiety' 
      ? Math.sin(time * 5 + i) * 10 
      : emotionType === 'anger'
        ? Math.sin(time * 8 + i) * 15
        : Math.sin(time * 0.5 + i) * 3;

    ctx.beginPath();
    
    // Draw organic shape instead of perfect circle for anxiety/anger
    if (emotionType === 'anxiety' || emotionType === 'anger') {
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 6 + time * 3) * distortion;
        const r = layerSize + wobble;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      ctx.arc(centerX, centerY, layerSize + distortion, 0, Math.PI * 2);
    }

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, layerSize
    );
    gradient.addColorStop(0, hexToRgba(color, alpha));
    gradient.addColorStop(0.7, hexToRgba(color, alpha * 0.5));
    gradient.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Inner core
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.6);
  ctx.fill();
}

// Draw peripheral waves
function drawPeripheralWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  breathSize: number,
  time: number,
  emotionType: string
) {
  const waveCount = emotionType === 'anxiety' ? 8 : emotionType === 'calm' ? 3 : 5;
  const speed = emotionType === 'anxiety' ? 3 : emotionType === 'peace' ? 0.5 : 1;

  for (let i = 0; i < waveCount; i++) {
    const offset = (i / waveCount) * Math.PI * 2;
    const wavePhase = time * speed + offset;
    const waveAmplitude = breathSize * 0.1;
    
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.1);
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 5) {
      const distFromCenter = Math.abs(x - width / 2) / (width / 2);
      const y = height / 2 + 
        Math.sin(x * 0.02 + wavePhase) * waveAmplitude * (1 - distFromCenter) +
        Math.sin(x * 0.01 + wavePhase * 0.5) * waveAmplitude * 0.5;
      
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
