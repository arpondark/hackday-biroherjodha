import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { EmotionCanvas } from '../emotion/EmotionCanvas';
import { cn } from '@/utils/cn';

const durations = [
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];

interface FrequencyMode {
  name: string;
  frequency: number;
  color: string;
  pattern: 'waves' | 'particles' | 'spirals' | 'ripples';
  description: string;
  icon: string;
}

const frequencyModes: FrequencyMode[] = [
  {
    name: 'Peace',
    frequency: 432,
    color: '#6C63FF',
    pattern: 'waves',
    description: 'Natural tuning frequency for inner peace and stress relief',
    icon: '☮️',
  },
  {
    name: 'Love',
    frequency: 528,
    color: '#FF69B4',
    pattern: 'ripples',
    description: 'DNA repair frequency for love, healing, and transformation',
    icon: '💖',
  },
  {
    name: 'Connection',
    frequency: 639,
    color: '#50C878',
    pattern: 'particles',
    description: 'Harmonizing relationships and enhancing communication',
    icon: '🤝',
  },
  {
    name: 'Awakening',
    frequency: 741,
    color: '#FFB347',
    pattern: 'spirals',
    description: 'Awakening intuition and expanding consciousness',
    icon: '✨',
  },
  {
    name: 'Enlightenment',
    frequency: 963,
    color: '#9D84B7',
    pattern: 'waves',
    description: 'Highest frequency for spiritual enlightenment and divine connection',
    icon: '🌟',
  },
];

export const TherapyPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { suggestedMode?: string; reason?: string } | null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FrequencyMode>(frequencyModes[0]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Auto-selection Logic
  useEffect(() => {
    if (state?.suggestedMode) {
      const mode = frequencyModes.find(m => m.name === state.suggestedMode);
      if (mode) {
        setSelectedMode(mode);
      }
    }
  }, [state]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            stopSound();
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, duration]);

  const startSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // Create oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(selectedMode.frequency, ctx.currentTime);

    // Create gain node for volume
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

    // Connect
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start
    osc.start();
    
    oscillatorRef.current = osc;
    gainNodeRef.current = gainNode;
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
    setIsPlaying(!isPlaying);
  };

  const handleModeSelect = (mode: FrequencyMode) => {
    setSelectedMode(mode);
    if (isPlaying) {
      stopSound();
      // Small timeout to allow cleanup
      setTimeout(() => {
        // Start new sound with new frequency
        // We need to pass the new mode explicitly or use a ref, 
        // but since state update is async, best to restart manually or rely on effect.
        // Simple approach: stop, update state. User presses play again or we auto-restart logic could be added.
        setIsPlaying(false); 
      }, 50);
    }
    setTimeLeft(duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (!isMuted && gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioContextRef.current!.currentTime);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newMuted ? 0 : volume, audioContextRef.current.currentTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-black relative">
      
      {/* Suggested Reason Overlay if present */}
      {state?.reason && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A103C]/90 backdrop-blur-md px-6 py-3 rounded-full border border-accent-secondary/30 shadow-lg flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
          <span className="text-white/90 text-sm font-medium">{state.reason}</span>
        </motion.div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <EmotionCanvas
          color={selectedMode.color}
          pattern={selectedMode.pattern}
          motionIntensity={isPlaying ? 0.8 : 0.3}
          mode="Generate"
        />
        
        {/* Center Timer/Control */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            className="w-64 h-64 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center relative pointer-events-auto group"
            animate={{ 
              scale: isPlaying ? [1, 1.02, 1] : 1,
              borderColor: isPlaying ? selectedMode.color : 'rgba(255,255,255,0.1)' 
            }}
            transition={{ duration: 4, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
          >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeOpacity="0.1"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke={selectedMode.color}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "linear" }}
                style={{ pathLength: progress / 100 }}
              />
            </svg>

            <div className="relative z-10 text-center space-y-2">
              <div className="text-4xl font-light text-white tabular-nums tracking-wider">
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all mx-auto"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-1" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div 
        className="w-full md:w-96 bg-gradient-to-b from-black/60 via-black/40 to-black/60 
                    backdrop-blur-2xl border-l border-white/10 p-8 space-y-8 overflow-y-auto
                    shadow-[-20px_0_60px_-15px_rgba(108,99,255,0.2)] 
                    md:max-h-screen max-h-[calc(100vh-20rem)]"
      >
        {/* Header with Decorative Line */}
        <div className="relative pt-20">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: '40px' }} 
            className="h-1 bg-accent-secondary mb-4"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Resonance</h2>
          <p className="text-white/60 text-sm">Select a frequency to align your state.</p>
        </div>

        {/* Modes Grid */}
        <div className="grid gap-3">
          {frequencyModes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => handleModeSelect(mode)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all duration-300 group relative overflow-hidden",
                selectedMode.name === mode.name
                  ? "bg-white/10 border-white/20 shadow-lg"
                  : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
            >
              {selectedMode.name === mode.name && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"
                />
              )}
              
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mode.icon}</span>
                    <span className={cn(
                      "font-medium transition-colors",
                      selectedMode.name === mode.name ? "text-white" : "text-white/70"
                    )}>
                      {mode.name}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 font-mono">
                    {mode.frequency} Hz
                  </div>
                </div>
                {selectedMode.name === mode.name && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4 pb-1">
                     {[1,2,3,4].map(i => (
                       <motion.div 
                         key={i}
                         className="w-0.5 bg-accent-secondary"
                         animate={{ height: [4, 12, 4] }}
                         transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                       />
                     ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Duration Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Session Duration</label>
          <div className="flex bg-white/5 p-1 rounded-lg">
            {durations.map((d) => (
              <button
                key={d.label}
                onClick={() => {
                  setDuration(d.value);
                  setTimeLeft(d.value);
                  setIsPlaying(false);
                  stopSound();
                }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                  duration === d.value
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Master Volume</span>
              <span className="text-xs font-mono text-white/60">{Math.round(volume * 100)}%</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
           </div>
        </div>

      </div>
    </div>
  );
};
