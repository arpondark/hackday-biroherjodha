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

export const TherapyPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
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
    
    // Create oscillator for calming frequency (432 Hz)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(432, audioContext.currentTime);
    
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
    <div className="h-full w-full flex flex-col md:flex-row">
      {/* Canvas Area */}
      <div className="flex-1 relative">
        <EmotionCanvas
          color="#6C63FF"
          pattern="pulse"
          motionIntensity={isPlaying ? 0.3 : 0.1}
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
      <div className="w-full md:w-80 glass-effect p-6 space-y-6">
        <h2 className="text-2xl font-bold gradient-text">Therapy Mode</h2>

        {/* Duration Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">Session Duration</label>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((d) => (
              <motion.button
                key={d.value}
                onClick={() => {
                  setDuration(d.value);
                  setTimeLeft(d.value);
                }}
                disabled={isPlaying}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  duration === d.value
                    ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                    : 'glass-effect text-white/80 hover:bg-white/10',
                  isPlaying && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!isPlaying ? { scale: 1.05 } : {}}
                whileTap={!isPlaying ? { scale: 0.95 } : {}}
              >
                {d.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80">Volume</label>
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white/60" />
              ) : (
                <Volume2 className="w-5 h-5 text-white/60" />
              )}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-primary 
                     [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">About Therapy Mode</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Experience calming frequencies (432 Hz) combined with slow, gentle visual motion.
              Perfect for meditation, relaxation, or emotional regulation.
            </p>
          </div>
          
          <div className="glass-effect p-3 rounded-lg">
            <p className="text-xs text-white/60">
              💡 Use headphones for the best experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
