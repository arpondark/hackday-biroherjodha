import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface RhythmCanvasProps {
  color: string;
  onRhythmChange?: (bpm: number) => void;
}

interface TapEvent {
  timestamp: number;
  x: number;
  y: number;
}

interface RippleWave {
  id: number;
  x: number;
  y: number;
  timestamp: number;
  intensity: number;
}

interface PulseBar {
  id: number;
  height: number;
  timestamp: number;
}

export const RhythmCanvas: React.FC<RhythmCanvasProps> = ({ color, onRhythmChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [taps, setTaps] = useState<TapEvent[]>([]);
  const [bpm, setBpm] = useState<number>(0);
  const [ripples, setRipples] = useState<RippleWave[]>([]);
  const [pulseBars, setPulseBars] = useState<PulseBar[]>([]);
  const [rhythmStyle, setRhythmStyle] = useState<'calm' | 'moderate' | 'energetic'>('calm');
  const rippleIdRef = useRef(0);
  const pulseIdRef = useRef(0);

  // Calculate BPM from taps
  const calculateBPM = useCallback((tapEvents: TapEvent[]) => {
    if (tapEvents.length < 2) return 0;
    
    const recentTaps = tapEvents.slice(-10); // Last 10 taps
    const intervals: number[] = [];
    
    for (let i = 1; i < recentTaps.length; i++) {
      intervals.push(recentTaps[i].timestamp - recentTaps[i - 1].timestamp);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const calculatedBpm = Math.round(60000 / avgInterval);
    
    return Math.min(Math.max(calculatedBpm, 20), 240); // Clamp between 20-240 BPM
  }, []);

  // Determine rhythm style based on BPM
  useEffect(() => {
    if (bpm < 60) {
      setRhythmStyle('calm');
    } else if (bpm < 120) {
      setRhythmStyle('moderate');
    } else {
      setRhythmStyle('energetic');
    }
  }, [bpm]);

  // Handle tap/click
  const handleTap = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const now = Date.now();
    const newTap: TapEvent = { timestamp: now, x, y };
    
    setTaps(prev => {
      const updated = [...prev, newTap].filter(t => now - t.timestamp < 5000); // Keep last 5 seconds
      const newBpm = calculateBPM(updated);
      setBpm(newBpm);
      onRhythmChange?.(newBpm);
      return updated;
    });

    // Create ripple effect
    const intensity = taps.length > 1 
      ? Math.min(1, 1000 / (now - taps[taps.length - 1]?.timestamp || 1000))
      : 0.5;

    setRipples(prev => [...prev, {
      id: rippleIdRef.current++,
      x,
      y,
      timestamp: now,
      intensity
    }]);

    // Create pulse bar
    setPulseBars(prev => [...prev, {
      id: pulseIdRef.current++,
      height: 20 + intensity * 80,
      timestamp: now
    }]);

    // Clean up old ripples and bars
    setTimeout(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.timestamp < 2000));
      setPulseBars(prev => prev.filter(b => Date.now() - b.timestamp < 1500));
    }, 2000);
  }, [taps, calculateBPM, onRhythmChange]);

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
      const now = Date.now();

      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Draw ambient background waves based on rhythm style
      const waveIntensity = rhythmStyle === 'energetic' ? 1.5 : rhythmStyle === 'moderate' ? 1 : 0.5;
      drawAmbientWaves(ctx, width, height, color, time, waveIntensity);

      // Draw ripples from taps
      ripples.forEach(ripple => {
        const age = (now - ripple.timestamp) / 1000;
        const maxRadius = 150 * ripple.intensity;
        const radius = age * maxRadius * 2;
        const alpha = Math.max(0, 1 - age);

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(color, alpha * 0.8);
        ctx.lineWidth = 3 * (1 - age * 0.5);
        ctx.stroke();

        // Inner glow
        const gradient = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, radius);
        gradient.addColorStop(0, hexToRgba(color, alpha * 0.3));
        gradient.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw pulse visualization at bottom
      const barWidth = 8;
      const barGap = 4;
      const startX = width / 2 - (pulseBars.length * (barWidth + barGap)) / 2;
      
      pulseBars.forEach((bar, i) => {
        const age = (now - bar.timestamp) / 1000;
        const alpha = Math.max(0, 1 - age / 1.5);
        const currentHeight = bar.height * (1 - age * 0.3);

        ctx.fillStyle = hexToRgba(color, alpha);
        ctx.fillRect(
          startX + i * (barWidth + barGap),
          height - 30 - currentHeight,
          barWidth,
          currentHeight
        );
      });

      // Draw center pulse indicator
      const pulseSize = 20 + Math.sin(time * (bpm / 30 || 1)) * 10;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.4);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, [color, ripples, pulseBars, bpm, rhythmStyle]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        onClick={handleTap}
        onTouchStart={handleTap}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* BPM Display */}
      <AnimatePresence>
        <motion.div
          key={bpm}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl"
        >
          <div className="text-3xl font-bold text-white">{bpm || '--'}</div>
          <div className="text-xs text-white/60 uppercase tracking-wider">BPM</div>
        </motion.div>
      </AnimatePresence>

      {/* Rhythm Style Indicator */}
      <motion.div
        className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg"
        animate={{
          backgroundColor: rhythmStyle === 'energetic' 
            ? 'rgba(239, 68, 68, 0.3)' 
            : rhythmStyle === 'moderate' 
              ? 'rgba(251, 191, 36, 0.3)' 
              : 'rgba(59, 130, 246, 0.3)'
        }}
      >
        <span className="text-sm text-white capitalize">{rhythmStyle}</span>
      </motion.div>

      {/* Tap instruction */}
      {taps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-white/40 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl mb-2"
            >
              👆
            </motion.div>
            <p className="text-sm">Tap to create rhythm</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Ambient wave drawing function
function drawAmbientWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number,
  intensity: number
) {
  const waves = 3;
  for (let i = 0; i < waves; i++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.1 + i * 0.05);
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x += 5) {
      const y = height / 2 + 
        Math.sin(x * 0.005 + time * intensity + i) * 30 * intensity +
        Math.sin(x * 0.01 + time * 0.5 * intensity) * 20 * intensity;
      
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
