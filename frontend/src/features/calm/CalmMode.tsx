import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, AlertCircle, Headphones } from 'lucide-react';
import { EmotionCanvas } from '@/features/emotion/EmotionCanvas';
import { emotionService, EmotionPost } from '@/services/emotionService';
import { Loader } from '@/components/Loader/Loader';
import { cn } from '@/utils/cn';
import { PatternType } from '@/utils/emotions';

const frequencies = [
  { name: '432 Hz - Peace', value: 432, description: 'Natural healing frequency' },
  { name: '528 Hz - Love', value: 528, description: 'Transformation & DNA repair' },
  { name: '639 Hz - Connection', value: 639, description: 'Harmonious relationships' },
  { name: '741 Hz - Awakening', value: 741, description: 'Intuition & expression' },
];

export const CalmMode: React.FC = () => {
  const [signals, setSignals] = useState<EmotionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<EmotionPost | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0]);
  const [duration, setDuration] = useState(300); // 5 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(300);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user's emotion history
  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    if (signals.length > 0 && !selectedSignal) {
      setSelectedSignal(signals[0]);
    }
  }, [signals, selectedSignal]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const data = await emotionService.getHistory();
      setSignals(data);
    } catch (err) {
      console.error('Failed to load signals:', err);
    } finally {
      setLoading(false);
    }
  };

  const startAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    // Resume if suspended (browser policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(selectedFrequency.value, audioContext.currentTime);
    
    // Gentle fade in
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    setIsPlaying(true);
    // Only reset timer if starting fresh, but toggle behavior might want resume.
    // However, simplistic play/pause usually toggles active/inactive.
    // The previous code reset timer on startAudio call implicitly by not tracking pause state separately strictly.
    // Let's keep it simple: Start = Play from current or fresh.
    
    // Clear any existing timer to avoid dupes
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopAudio();
          return duration;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAudio = () => {
    if (gainNodeRef.current && oscillatorRef.current && audioContextRef.current) {
      const audioContext = audioContextRef.current;
      // Gentle fade out
      try {
          gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      } catch (e) {
          // ignore if already disconnected
      }
      
      setTimeout(() => {
        try {
            oscillatorRef.current?.stop();
            oscillatorRef.current?.disconnect();
            gainNodeRef.current?.disconnect();
        } catch(e) {/* ignore */}
        
        oscillatorRef.current = null;
        gainNodeRef.current = null;
      }, 1000);
    }

    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
        stopAudio();
    } else {
        startAudio();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (signals.length === 0) {
    return (
      <div className="min-h-screen pt-48 pb-8 px-8 container mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-accent-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-3">
            No Signals Yet
          </h2>
          <p className="text-white/60">
            Create some emotional signals first, then come back here to experience calm mode.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 pb-8 px-8 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="w-6 h-6 text-accent-primary" />
            <h2 className="text-2xl font-semibold text-white">Calm Mode</h2>
          </div>
          
          <p className="text-white/70 mb-8">
            Choose a past emotional signal and let it play with soothing frequencies to help you destress and find peace.
          </p>

          {/* Signal Selection */}
          <div className="mb-8">
            <label className="text-white/80 text-sm font-medium mb-3 block">
              Select a Signal
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {signals.slice(0, 8).map((signal) => (
                <motion.button
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-xl transition-all duration-300',
                    selectedSignal?.id === signal.id
                      ? 'bg-accent-primary ring-2 ring-accent-secondary'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  <div
                    className="w-full h-12 rounded-lg mb-2"
                    style={{ backgroundColor: signal.color }}
                  />
                  <div className="text-white text-xs capitalize">{signal.pattern}</div>
                  <div className="text-white/50 text-xs">
                    {new Date(signal.createdAt).toLocaleDateString()}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="mb-8">
            <label className="text-white/80 text-sm font-medium mb-3 block">
              Healing Frequency
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {frequencies.map((freq) => (
                <motion.button
                  key={freq.value}
                  onClick={() => !isPlaying && setSelectedFrequency(freq)}
                  whileHover={{ scale: isPlaying ? 1 : 1.02 }}
                  whileTap={{ scale: isPlaying ? 1 : 0.98 }}
                  className={cn(
                    'p-4 rounded-xl transition-all duration-300 text-left',
                    selectedFrequency.value === freq.value
                      ? 'bg-accent-primary text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10',
                    isPlaying && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="font-semibold text-sm">{freq.name}</div>
                  <div className="text-xs opacity-70 mt-1">{freq.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="text-white/80 text-sm font-medium mb-3 block">
              Duration: {Math.floor(duration / 60)} minutes
            </label>
            <input
              type="range"
              min="60"
              max="1800"
              step="60"
              value={duration}
              onChange={(e) => {
                  const val = Number(e.target.value);
                  setDuration(val);
                  setTimeRemaining(val);
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
              disabled={isPlaying}
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.button
              onClick={togglePlayback}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
                isPlaying
                  ? 'bg-accent-primary hover:bg-accent-primary/80 shadow-lg shadow-accent-primary/50'
                  : 'bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/50'
              )}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>
            
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-white"
                >
                  <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
                  <div className="text-white/50 text-sm">remaining</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Visual Canvas */}
          {selectedSignal && (
            <div className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/5 h-64">
              <EmotionCanvas
                color={selectedSignal.color}
                pattern={selectedSignal.pattern as PatternType}
                motionIntensity={Math.max(0.2, selectedSignal.motionIntensity * 0.5)} // Calmer intensity
              />
              
              {/* Calm overlay */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, transparent 30%, ${selectedSignal.color}20 100%)`
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 backdrop-blur-lg rounded-2xl p-6 border border-accent-primary/20"
        >
          <div className="flex items-start gap-4">
            <Headphones className="w-8 h-8 text-accent-primary flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-2">How to Use Calm Mode</h3>
              <p className="text-white/70 text-sm">
                Find a quiet space, put on headphones for the best experience, and let the soothing 
                frequency and visual guide you to a state of calm. Focus on your breath and let your mind relax.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Frequency Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-white font-medium mb-4">About Healing Frequencies</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-white/80">432 Hz:</span>
                <span className="text-white/50">Calming, promotes inner peace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="text-white/80">528 Hz:</span>
                <span className="text-white/50">Love frequency, transformation</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-white/80">639 Hz:</span>
                <span className="text-white/50">Harmony and connection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <span className="text-white/80">741 Hz:</span>
                <span className="text-white/50">Intuition and expression</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
