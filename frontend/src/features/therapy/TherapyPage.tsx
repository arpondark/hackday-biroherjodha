import React, { useState, useEffect, useRef } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FrequencyMode>(frequencyModes[0]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    
    // Create oscillator for selected frequency
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(selectedMode.frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSound();
    } else {
      setIsPlaying(true);
      setTimeLeft(duration);
      startSound();
    }
  };

  const handleModeChange = (mode: FrequencyMode) => {
    if (isPlaying) {
      stopSound();
      setSelectedMode(mode);
      setTimeout(() => startSound(), 100);
    } else {
      setSelectedMode(mode);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(newVolume * 0.3, audioContextRef.current!.currentTime);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newMuted ? 0 : volume * 0.3,
        audioContextRef.current!.currentTime
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-black overflow-hidden pt-40">
      {/* Canvas Area */}
      <div className="flex-1 relative">
        <EmotionCanvas
          color={selectedMode.color}
          pattern={selectedMode.pattern}
          motionIntensity={isPlaying ? 0.4 : 0.1}
        />

        {/* Timer Display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-7xl md:text-9xl font-bold text-white/90 mb-4">
              {formatTime(timeLeft)}
            </div>
            <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Play/Pause Button */}
        <motion.button
          onClick={handlePlayPause}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full 
                   bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center 
                   justify-center shadow-lg shadow-accent-primary/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </motion.button>
      </div>

      {/* Controls Panel */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full md:w-96 bg-gradient-to-b from-black/60 via-black/40 to-black/60 
                   backdrop-blur-2xl border-l border-white/10 p-8 space-y-8 overflow-y-auto
                   shadow-[-20px_0_60px_-15px_rgba(108,99,255,0.2)] 
                   max-h-[calc(100vh-10rem)]"
      >
        {/* Header with Decorative Line */}
        <div className="relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -top-2 left-0 h-0.5 bg-gradient-to-r from-accent-primary via-accent-secondary to-transparent"
          />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 
                          flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span className="text-xl">🧘</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Therapy Mode
              </h2>
              <p className="text-xs text-white/50">Healing frequencies for your soul</p>
            </div>
          </div>
        </div>

        {/* Frequency Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-primary to-accent-secondary" />
            <label className="text-sm font-semibold text-white/90 uppercase tracking-wider">Frequency Mode</label>
          </div>
          <div className="space-y-2">
            {frequencyModes.map((mode, index) => (
              <motion.button
                key={mode.name}
                onClick={() => handleModeChange(mode)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-full p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group',
                  selectedMode.name === mode.name
                    ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-2 border-accent-primary/50 shadow-lg shadow-accent-primary/20'
                    : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                )}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow effect for selected */}
                {selectedMode.name === mode.name && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative flex items-center gap-4">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
                      selectedMode.name === mode.name 
                        ? "bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg" 
                        : "bg-white/10 group-hover:bg-white/15"
                    )}
                    style={{ 
                      boxShadow: selectedMode.name === mode.name ? `0 4px 20px ${mode.color}40` : 'none'
                    }}
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{mode.name}</span>
                      <span 
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-mono",
                          selectedMode.name === mode.name 
                            ? "bg-accent-primary/30 text-accent-primary" 
                            : "bg-white/10 text-white/60"
                        )}
                      >
                        {mode.frequency} Hz
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">{mode.description}</p>
                  </div>
                  
                  {/* Active indicator */}
                  {selectedMode.name === mode.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-primary shadow-lg shadow-accent-primary/50"
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-secondary to-pink-500" />
            <label className="text-sm font-semibold text-white/90 uppercase tracking-wider">Session Duration</label>
          </div>
          <div className="flex gap-3">
            {durations.map((d) => (
              <motion.button
                key={d.value}
                onClick={() => {
                  setDuration(d.value);
                  setTimeLeft(d.value);
                }}
                disabled={isPlaying}
                className={cn(
                  'flex-1 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden',
                  duration === d.value
                    ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/30'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20',
                  isPlaying && 'opacity-40 cursor-not-allowed'
                )}
                whileHover={!isPlaying ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isPlaying ? { scale: 0.95 } : {}}
              >
                {duration === d.value && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                )}
                <span className="relative">{d.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-green-400 to-emerald-600" />
              <label className="text-sm font-semibold text-white/90 uppercase tracking-wider">Volume</label>
            </div>
            <motion.button
              onClick={toggleMute}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isMuted 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : "bg-white/10 text-white/70 border border-white/10 hover:bg-white/15"
              )}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 h-3 rounded-full bg-white/10 top-1/2 -translate-y-1/2" />
            <motion.div 
              className="absolute h-3 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary top-1/2 -translate-y-1/2"
              style={{ width: `${volume * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="relative w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer z-10
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                       [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-accent-primary/50
                       [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-primary
                       [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white 
                       [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent-primary
                       [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 font-mono">
            <span>0%</span>
            <span>{Math.round(volume * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mode Info Card */}
        <motion.div 
          key={selectedMode.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-white/10"
        >
          {/* Background gradient based on mode color */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: `linear-gradient(135deg, ${selectedMode.color}40 0%, transparent 60%)` 
            }}
          />
          
          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${selectedMode.color}30` }}
              >
                {selectedMode.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{selectedMode.name} Mode</h3>
                <p className="text-xs font-mono" style={{ color: selectedMode.color }}>{selectedMode.frequency} Hz</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {selectedMode.description}
            </p>
            
            {/* Decorative wave */}
            <div className="flex items-center gap-1 opacity-50">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: selectedMode.color }}
                  animate={{ 
                    height: isPlaying ? [4, 12, 4] : 4,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pro Tip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 
                     border border-amber-500/20"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-400/90 mb-1">Pro Tip</p>
            <p className="text-xs text-white/60 leading-relaxed">
              Use headphones for the best immersive healing experience
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
