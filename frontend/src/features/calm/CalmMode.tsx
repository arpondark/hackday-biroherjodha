import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, AlertCircle, Headphones, Radio, Wind, Heart, Zap, Sparkles, Clock } from 'lucide-react';
import { EmotionCanvas } from '@/features/emotion/EmotionCanvas';
import { emotionService, EmotionPost } from '@/services/emotionService';
import { Loader } from '@/components/Loader/Loader';
import { cn } from '@/utils/cn';
import { PatternType } from '@/utils/emotions';

const frequencies = [
  { name: 'Peace', hz: '432 Hz', value: 432, description: 'Natural healing & tranquility', icon: Wind },
  { name: 'Love', hz: '528 Hz', value: 528, description: 'DNA repair & transformation', icon: Heart },
  { name: 'Connect', hz: '639 Hz', value: 639, description: 'Harmonious relationships', icon: Radio },
  { name: 'Awaken', hz: '741 Hz', value: 741, description: 'Intuition & expression', icon: Zap },
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
      if (timerRef.current) clearInterval(timerRef.current);
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
    if (audioContext.state === 'suspended') audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(selectedFrequency.value, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    setIsPlaying(true);
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
      try {
          gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      } catch (e) {}
      
      setTimeout(() => {
        try {
            oscillatorRef.current?.stop();
            oscillatorRef.current?.disconnect();
            gainNodeRef.current?.disconnect();
        } catch(e) {}
        
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
    if (isPlaying) stopAudio();
    else startAudio();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loader fullScreen />;

  if (signals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B15] to-black -z-20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl p-12 border border-white/10 text-center max-w-md shadow-2xl"
        >
          <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="w-10 h-10 text-accent-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Ether Silence</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Your emotional spectrum is void. Transmit a signal to begin your resonance journey.
          </p>
          <button className="btn-primary w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-accent-primary/25">
             Create First Signal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 relative text-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
         <div className="absolute inset-0 bg-[#050508]" />
         <motion.div 
           animate={{ 
             opacity: isPlaying ? 0.4 : 0.2,
             scale: isPlaying ? [1, 1.1, 1] : 1
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-accent-primary/20 rounded-full blur-[120px]" 
         />
         <motion.div 
           animate={{ 
            opacity: isPlaying ? 0.3 : 0.1,
            rotate: isPlaying ? 360 : 0
           }}
           transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
           className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-secondary/20 rounded-full blur-[120px]" 
         />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Left Column: Calm Interface */}
         <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Header */}
            <div>
               <div className="flex items-center gap-3 mb-2 opacity-60">
                  <Sparkles className="w-5 h-5 text-accent-secondary" />
                  <span className="font-mono uppercase tracking-widest text-sm">Resonance Chamber</span>
               </div>
               <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 tracking-tight mb-4">
                  Deep Calm
               </h1>
               <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                  Harmonize your past emotional peaks with healing frequencies. Restore balance through sonic intervention.
               </p>
            </div>

            {/* Visualizer Window */}
            <div className="relative w-full aspect-video lg:aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group">
               {/* Glass Overlay */}
               <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] rounded-[2.5rem]" />
               
               {selectedSignal ? (
                 <>
                   <EmotionCanvas
                     color={selectedSignal.color}
                     pattern={selectedSignal.pattern as PatternType}
                     motionIntensity={isPlaying ? Math.max(0.2, selectedSignal.motionIntensity * 0.4) : 0.1} 
                   />
                   
                   {/* Breathing Overlay when playing */}
                   <AnimatePresence>
                      {isPlaying && (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: [0, 0.3, 0] }}
                           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                           className="absolute inset-0 bg-accent-primary mix-blend-overlay z-10"
                        />
                      )}
                   </AnimatePresence>
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Headphones className="w-16 h-16" />
                 </div>
               )}

               {/* UI Overlays */}
               <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
                  {isPlaying && (
                    <div className="px-3 py-1.5 bg-accent-primary/20 backdrop-blur-md rounded-full border border-accent-primary/30 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-primary animate-pulse">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Active Session
                    </div>
                  )}
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/50 text-xs font-mono">
                     {selectedFrequency.hz}
                  </div>
               </div>
            </div>

            {/* Signal Selector using 3D Cards */}
            <div>
               <label className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 block">Select Emotional Anchor</label>
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {signals.map((signal) => (
                     <button
                        key={signal.id}
                        onClick={() => setSelectedSignal(signal)}
                        className="group relative flex-shrink-0 w-32 snap-start"
                     >
                        <div className={cn(
                           "w-full aspect-square rounded-2xl relative overflow-hidden transition-all duration-300 border",
                           selectedSignal?.id === signal.id 
                              ? "scale-105 border-accent-primary shadow-[0_0_20px_rgba(108,99,255,0.3)] ring-2 ring-accent-primary/20" 
                              : "border-white/10 hover:border-white/30 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                        )}>
                           <div className="absolute inset-0 opacity-80" style={{ background: signal.color }} />
                           <div className="absolute inset-0 flex items-center justify-center">
                              {/* Mini pattern representation could go here */}
                           </div>
                           
                           {selectedSignal?.id === signal.id && (
                              <motion.div layoutId="activeSignal" className="absolute inset-0 ring-inset ring-2 ring-white/50 rounded-2xl" />
                           )}
                        </div>
                        <div className="mt-2 text-center">
                           <div className={cn("text-xs font-bold uppercase tracking-wider transition-colors", selectedSignal?.id === signal.id ? "text-white" : "text-white/40")}>
                              {signal.pattern}
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column: Controls */}
         <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-32">
            
            {/* Control Deck */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 blur-2xl" />

               {/* Timer Display */}
               <div className="text-center mb-10">
                  <div className="text-7xl font-black tabular-nums tracking-tighter text-white mb-2 relative inline-block">
                     {formatTime(timeRemaining)}
                     {isPlaying && <span className="absolute -right-6 top-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-white/40 text-sm font-mono uppercase tracking-widest">
                     <Clock className="w-4 h-4" /> Session Duration
                  </div>
               </div>

               {/* Play Button - The Centerpiece */}
               <div className="flex justify-center mb-10">
                  <button
                     onClick={togglePlayback}
                     className={cn(
                        "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 group",
                        isPlaying 
                           ? "bg-[#0B0B15] border-2 border-accent-primary shadow-[0_0_30px_rgba(108,99,255,0.4)]" 
                           : "bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
                     )}
                  >
                     {/* Pulse rings when playing */}
                     {isPlaying && (
                        <>
                           <span className="absolute inset-0 rounded-full border border-accent-primary opacity-50 animate-ping-slow" />
                           <span className="absolute inset-0 rounded-full border border-accent-primary opacity-30 animate-ping-slower delay-150" />
                        </>
                     )}
                     
                     <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {isPlaying ? (
                           <Pause className="w-10 h-10 text-accent-primary" fill="currentColor" />
                        ) : (
                           <Play className="w-10 h-10 ml-1 text-black" fill="currentColor" />
                        )}
                     </div>
                  </button>
               </div>

               {/* Sliders Area */}
               <div className="space-y-6">
                  {/* Duration Slider */}
                  <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
                        <span>Duration</span>
                        <span>{Math.floor(duration/60)} Mins</span>
                     </div>
                     <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group">
                        <div 
                           className="absolute top-0 left-0 h-full bg-white transition-all duration-300" 
                           style={{ width: `${(duration / 1800) * 100}%` }}
                        />
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
                           disabled={isPlaying}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                     </div>
                  </div>

                  {/* Frequencies List */}
                  <div className="pt-6 border-t border-white/10">
                     <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 block">Healing Frequencies</label>
                     <div className="space-y-2">
                        {frequencies.map((freq) => (
                           <button
                              key={freq.value}
                              onClick={() => !isPlaying && setSelectedFrequency(freq)}
                              disabled={isPlaying}
                              className={cn(
                                 "w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300 text-left border",
                                 selectedFrequency.value === freq.value 
                                    ? "bg-white/10 border-white/20 shadow-lg translate-x-2" 
                                    : "bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100"
                              )}
                           >
                              <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                 selectedFrequency.value === freq.value ? "bg-white text-black" : "bg-white/10 text-white"
                              )}>
                                 <freq.icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{freq.name}</span>
                                    <span className="text-xs font-mono text-accent-primary bg-accent-primary/10 px-1.5 rounded">{freq.hz}</span>
                                 </div>
                                 <div className="text-xs text-white/50 line-clamp-1">{freq.description}</div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Hint Box */}
            <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/5 backdrop-blur-xl rounded-2xl p-6 border border-white/5 flex gap-4">
               <Headphones className="w-6 h-6 text-accent-primary flex-shrink-0" />
               <p className="text-xs text-white/70 leading-relaxed font-light">
                  <strong className="text-white block mb-1 font-bold tracking-wide">Audio Immersion Recommended</strong>
                  Headphones are highly suggested. Close your eyes and let the frequency realign your emotional state.
               </p>
            </div>

         </div>

      </div>
    </div>
  );
};
