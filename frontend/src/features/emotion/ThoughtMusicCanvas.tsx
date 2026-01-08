import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';

interface ThoughtMusicCanvasProps {
  color: string;
  onSoundData?: (data: { frequency: number; amplitude: number }) => void;
}

interface MovementData {
  x: number;
  y: number;
  timestamp: number;
  speed: number;
}

interface SoundLayer {
  frequency: number;
  amplitude: number;
  pan: number;
  type: OscillatorType;
  active: boolean;
}

export const ThoughtMusicCanvas: React.FC<ThoughtMusicCanvasProps> = ({ color, onSoundData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const animationRef = useRef<number>(1);
  
  const [isActive, setIsActive] = useState(false);
  const [movementHistory, setMovementHistory] = useState<MovementData[]>([]);
  const [pauseDuration, setPauseDuration] = useState(0);
  const [stillnessDepth, setStillnessDepth] = useState(0);
  const lastMoveRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound layer configuration based on movement patterns
  const soundLayers = useRef<SoundLayer[]>([
    { frequency: 220, amplitude: 0, pan: -0.5, type: 'sine', active: false },
    { frequency: 330, amplitude: 0, pan: 0, type: 'triangle', active: false },
    { frequency: 440, amplitude: 0, pan: 0.5, type: 'sine', active: false },
    { frequency: 165, amplitude: 0, pan: 0, type: 'sine', active: false }, // Bass from stillness
  ]);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create or update oscillator for a layer
  const updateOscillator = useCallback((layerIndex: number, layer: SoundLayer) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const key = `layer_${layerIndex}`;
    
    if (layer.amplitude > 0.01 && !oscillatorsRef.current.has(key)) {
      // Create new oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      
      osc.type = layer.type;
      osc.frequency.setValueAtTime(layer.frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      panner.pan.setValueAtTime(layer.pan, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      
      osc.start();
      oscillatorsRef.current.set(key, osc);
      gainNodesRef.current.set(key, gain);
    }
    
    const gain = gainNodesRef.current.get(key);
    const osc = oscillatorsRef.current.get(key);
    
    if (gain && ctx) {
      gain.gain.linearRampToValueAtTime(
        Math.min(layer.amplitude * 0.15, 0.15),
        ctx.currentTime + 0.1
      );
    }
    
    if (osc && ctx) {
      osc.frequency.linearRampToValueAtTime(layer.frequency, ctx.currentTime + 0.1);
    }
  }, []);

  // Stop all oscillators
  const stopAllOscillators = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    gainNodesRef.current.forEach((gain) => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    });

    setTimeout(() => {
      oscillatorsRef.current.forEach((osc) => {
        try { osc.stop(); } catch {}
      });
      oscillatorsRef.current.clear();
      gainNodesRef.current.clear();
    }, 600);
  }, []);

  // Handle mouse/touch movement
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

    const now = Date.now();
    let speed = 0;
    
    if (lastMoveRef.current) {
      const dx = x - lastMoveRef.current.x;
      const dy = y - lastMoveRef.current.y;
      const dt = (now - lastMoveRef.current.time) / 1000;
      speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;
    }

    lastMoveRef.current = { x, y, time: now };
    
    // Reset pause tracking
    setPauseDuration(0);
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
    }
    pauseTimerRef.current = setInterval(() => {
      setPauseDuration(prev => prev + 0.1);
    }, 100);

    // Update movement history
    setMovementHistory(prev => {
      const newHistory = [...prev, { x, y, timestamp: now, speed }];
      return newHistory.slice(-100); // Keep last 100 points
    });

    // Calculate sound parameters from movement
    const speedNormalized = Math.min(speed * 2, 1);
    const positionY = 1 - y; // Higher = higher pitch tendency

    // Update sound layers based on movement
    soundLayers.current[0].frequency = 220 + speedNormalized * 220;
    soundLayers.current[0].amplitude = speedNormalized;

    soundLayers.current[1].frequency = 330 + positionY * 110;
    soundLayers.current[1].amplitude = 0.3;

    soundLayers.current[2].frequency = 440 + x * 110;
    soundLayers.current[2].amplitude = speedNormalized * 0.5;

    // Update oscillators
    soundLayers.current.forEach((layer, i) => updateOscillator(i, layer));

    if (onSoundData) {
      onSoundData({
        frequency: soundLayers.current[0].frequency,
        amplitude: speedNormalized
      });
    }
  }, [updateOscillator, onSoundData]);

  // Handle pause/stillness
  useEffect(() => {
    if (pauseDuration > 0.5) {
      // Stillness creates deep bass
      const bassIntensity = Math.min(pauseDuration / 5, 1);
      soundLayers.current[3].frequency = 110 - pauseDuration * 5;
      soundLayers.current[3].amplitude = bassIntensity * 0.5;
      updateOscillator(3, soundLayers.current[3]);
      
      setStillnessDepth(bassIntensity);
    } else {
      soundLayers.current[3].amplitude = 0;
      setStillnessDepth(0);
    }
  }, [pauseDuration, updateOscillator]);

  // Start/stop handlers
  const handleStart = useCallback(() => {
    initAudio();
    setIsActive(true);
  }, [initAudio]);

  const handleEnd = useCallback(() => {
    setIsActive(false);
    stopAllOscillators();
    if (pauseTimerRef.current) {
      clearInterval(pauseTimerRef.current);
    }
  }, [stopAllOscillators]);

  // Canvas visualization
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

      // Fade effect
      ctx.fillStyle = 'rgba(10, 5, 25, 0.08)';
      ctx.fillRect(0, 0, width, height);

      time += 0.02;

      // Draw movement trail as sound waves
      if (movementHistory.length > 1) {
        ctx.beginPath();
        movementHistory.forEach((point, i) => {
          const x = point.x * width;
          const y = point.y * height;
          const waveOffset = Math.sin(time * 3 + i * 0.2) * (point.speed * 20);
          
          if (i === 0) {
            ctx.moveTo(x, y + waveOffset);
          } else {
            ctx.lineTo(x, y + waveOffset);
          }
        });
        
        ctx.strokeStyle = hexToRgba(color, 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw sound visualization orbs for each layer
      soundLayers.current.forEach((layer, i) => {
        if (layer.amplitude > 0.01) {
          const x = width * (0.3 + i * 0.15);
          const y = height * 0.5 + Math.sin(time * 2 + i) * 30;
          const size = 20 + layer.amplitude * 40 + Math.sin(time * layer.frequency / 100) * 10;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, hexToRgba(shiftHue(color, i * 30), layer.amplitude * 0.6));
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Stillness visualization
      if (stillnessDepth > 0) {
        const centerX = width / 2;
        const centerY = height / 2;
        const pulseSize = 100 + stillnessDepth * 100 + Math.sin(time * 0.5) * 20;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, hexToRgba(color, stillnessDepth * 0.2));
        gradient.addColorStop(0.5, hexToRgba(color, stillnessDepth * 0.1));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stillness text
        ctx.fillStyle = hexToRgba('#fff', stillnessDepth * 0.3);
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`stillness: ${pauseDuration.toFixed(1)}s`, centerX, centerY + pulseSize + 20);
      }

      // Frequency visualization waves
      if (isActive) {
        ctx.strokeStyle = hexToRgba(color, 0.2);
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 3; i++) {
          const freq = soundLayers.current[i].frequency;
          const amp = soundLayers.current[i].amplitude;
          
          ctx.beginPath();
          for (let x = 0; x < width; x += 2) {
            const y = height * 0.8 + i * 20 + 
                      Math.sin(x * freq / 10000 + time * 5) * amp * 15;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [color, movementHistory, stillnessDepth, isActive, pauseDuration]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllOscillators();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (pauseTimerRef.current) {
        clearInterval(pauseTimerRef.current);
      }
    };
  }, [stopAllOscillators]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onMouseMove={isActive ? handleMove : undefined}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchMove={isActive ? handleMove : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Instructions */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center text-white/40">
            <p className="text-lg">hold & move to create sound</p>
            <p className="text-sm mt-2">pause to hear silence speak</p>
          </div>
        </motion.div>
      )}

      {/* Sound indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute top-4 right-4 flex items-center gap-2"
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-white/30">listening</span>
        </motion.div>
      )}
    </div>
  );
};

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
