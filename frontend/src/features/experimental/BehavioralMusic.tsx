import React, { useEffect, useRef, useState } from 'react';

export const BehavioralMusic: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ speed: 0, stillness: 0 });
  
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  const stillnessTimer = useRef<number | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(10, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    oscillatorRef.current = osc;
    gainRef.current = gain;
    filterRef.current = filter;
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!audioCtxRef.current) return;
      
      const now = Date.now();
      const dt = now - lastMousePos.current.time;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt; // pixels per ms

      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };

      // Update Audio based on speed
      const freq = 50 + speed * 200;
      const filterFreq = 200 + speed * 1000;
      const volume = Math.min(0.2, speed * 0.1);

      oscillatorRef.current?.frequency.exponentialRampToValueAtTime(Math.max(20, freq), audioCtxRef.current.currentTime + 0.1);
      filterRef.current?.frequency.exponentialRampToValueAtTime(Math.max(100, filterFreq), audioCtxRef.current.currentTime + 0.1);
      gainRef.current?.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.1);

      setStats(s => ({ ...s, speed }));

      // Reset stillness
      if (stillnessTimer.current) {
        window.clearTimeout(stillnessTimer.current);
      }
      stillnessTimer.current = window.setTimeout(() => {
         // Deep hum when still
         if (audioCtxRef.current) {
           oscillatorRef.current?.frequency.exponentialRampToValueAtTime(40, audioCtxRef.current.currentTime + 2);
           gainRef.current?.gain.linearRampToValueAtTime(0.05, audioCtxRef.current.currentTime + 2);
         }
         setStats(s => ({ ...s, speed: 0, stillness: 1 }));
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (stillnessTimer.current) window.clearTimeout(stillnessTimer.current);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col items-center justify-center text-white/40 font-mono">
      {!isPlaying ? (
        <button 
          onClick={initAudio}
          className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/5 transition-colors"
        >
          Initialize Texture
        </button>
      ) : (
        <div className="space-y-4 text-center">
          <div className="text-xl tracking-widest uppercase">Behavioral Resonance</div>
          <div className="text-xs opacity-50">Move your mouse to shape the hum</div>
          <div className="mt-8 flex gap-8 justify-center">
            <div>Speed: {stats.speed.toFixed(2)}</div>
            <div>Motion: {stats.speed > 0.1 ? 'Active' : 'Still'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
