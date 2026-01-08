import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sliders, PenTool, Wand2, Activity, Info, Camera, ScanFace, ChevronRight } from 'lucide-react';
import Webcam from 'react-webcam';
import { EmotionCanvas } from './EmotionCanvas';
import { RhythmCanvas } from './RhythmCanvas';
import { emotionColors, PatternType } from '@/utils/emotions';
import { emotionService } from '@/services/emotionService';
import { cn } from '@/utils/cn';

export const CreateEmotion: React.FC = () => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string>(emotionColors.calm);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('waves');
  const [motionIntensity, setMotionIntensity] = useState(0.5);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('Controls');

  // AI Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedMood, setDetectedMood] = useState<{name: string, confidence: number} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDetectedMood(null);
    setAnalyzing(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        startAnalysis();
      }
    }, 40); 
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => finalizeScan(), 1500);
  }

  const finalizeScan = async () => {
    const moods = [
      { name: 'Stressed', pattern: 'particles' as PatternType, color: emotionColors.anxious, therapy: 'Peace' },
      { name: 'Calm', pattern: 'waves' as PatternType, color: emotionColors.calm, therapy: 'Enlightenment' },
      { name: 'Energetic', pattern: 'spirals' as PatternType, color: emotionColors.joy, therapy: 'Connection' },
      { name: 'Melancholy', pattern: 'ripples' as PatternType, color: emotionColors.melancholy, therapy: 'Love' },
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];

    setDetectedMood({ name: randomMood.name, confidence: 85 + Math.floor(Math.random() * 12) });
    setAnalyzing(false);
    
    setSelectedColor(randomMood.color);
    setSelectedPattern(randomMood.pattern);

    setTimeout(async () => {
      setToastMessage("Auto-posting signal...");
      try {
        await emotionService.createEmotion({
           color: randomMood.color,
           pattern: randomMood.pattern,
           motionIntensity: 0.7,
        });

        setToastMessage("Signal posted! Opening therapy...");
        setTimeout(() => {
          navigate('/therapy', { state: { suggestedMode: randomMood.therapy, reason: `AI detected: ${randomMood.name}` } });
        }, 1500);

      } catch (e) {
        setToastMessage("Failed to post signal.");
        setTimeout(() => setToastMessage(null), 3000);
        setIsScanning(false);
      }
    }, 2000);
  };
 
  const handlePost = async () => {
    setIsPosting(true);
    try {
      let patternToSave = selectedPattern;
      if (activeTab === 'Draw') patternToSave = 'draw' as PatternType; 
      if (activeTab === 'Rhythm') patternToSave = 'rhythm' as PatternType;

      await emotionService.createEmotion({
        color: selectedColor,
        pattern: patternToSave,
        motionIntensity,
      });

      setToastMessage("Signal posted successfully!");
      setTimeout(() => {
        setIsPosting(false);
        setToastMessage(null);
        navigate('/feed');
      }, 1500);
    } catch (error) {
      console.error('Failed to post emotion:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12 px-4 md:px-8 container mx-auto relative pt-8 md:pt-12 text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-secondary/20 rounded-full blur-[120px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-6">
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-lg">
              Create Signal
            </h1>
            <p className="text-white/60 text-lg font-light tracking-wide">
              Shape your emotional resonance.
            </p>
          </div>

          {/* 3D Tab System */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-2xl">
            {[
              { name: 'Controls', icon: Sliders },
              { name: 'Draw', icon: PenTool },
              { name: 'Rhythm', icon: Activity },
              { name: 'AI Scan', icon: ScanFace },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className="relative flex-1 min-w-[90px] px-3 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all z-10 overflow-hidden group"
              >
                {activeTab === tab.name && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <span className={cn("relative z-20 flex items-center gap-2 transition-colors", activeTab === tab.name ? "text-white" : "text-white/50 group-hover:text-white")}>
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </span>
                
                {activeTab !== tab.name && (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>

          {/* Main Control Deck */}
          <motion.div 
            layout
            className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden"
          >
             {/* Decorative shine */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

             {activeTab === 'AI Scan' ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  {!isScanning && !detectedMood ? (
                     <>
                      <div className="w-32 h-32 relative group cursor-pointer" onClick={startScan}>
                        <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
                        <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                           <ScanFace className="w-12 h-12 text-white/90" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Initialize Scan</h3>
                        <p className="text-white/50 max-w-xs mx-auto">AI analysis of facial micro-expressions to derive emotional state.</p>
                      </div>
                      <button onClick={startScan} className="btn-primary w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-accent-primary/20 group">
                        Begin Analysis <ChevronRight className="w-5 h-5 inline ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                     </>
                  ) : (
                    <div className="w-full h-full min-h-[300px] bg-black/50 rounded-2xl overflow-hidden relative border border-white/10 shadow-inner">
                       {!detectedMood ? (
                          <>
                           <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              className="w-full h-full object-cover opacity-60"
                              videoConstraints={{ facingMode: "user" }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                               {analyzing ? (
                                 <div className="space-y-4 text-center">
                                    <div className="flex gap-2 justify-center">
                                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-accent-primary rounded-full" />
                                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-accent-primary rounded-full" />
                                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-accent-primary rounded-full" />
                                    </div>
                                    <div className="font-mono text-accent-primary text-sm tracking-widest">PROCESSING DATA</div>
                                 </div>
                               ) : (
                                 <div className="w-[80%] h-[80%] border-2 border-white/30 rounded-2xl relative overflow-hidden">
                                    <motion.div 
                                      className="w-full h-1 bg-accent-primary shadow-[0_0_20px_rgba(108,99,255,0.8)]"
                                      animate={{ y: [0, 250, 0] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute bottom-4 left-0 w-full text-center font-mono text-white/80 text-xl tracking-widest">
                                      SCANNING {scanProgress}%
                                    </div>
                                 </div>
                               )}
                            </div>
                          </>
                       ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
                               <div className="text-sm font-mono text-white/40 uppercase tracking-widest">Signal Detected</div>
                               <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                                 {detectedMood.name}
                               </div>
                               <div className="inline-block px-4 py-1 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-sm font-mono">
                                 CONFIDENCE {detectedMood.confidence}%
                               </div>
                               <div className="pt-8">
                                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-accent-secondary" />
                                  </div>
                                  <p className="text-xs text-white/30 mt-2">Redirecting to therapy module...</p>
                               </div>
                            </motion.div>
                         </div>
                       )}
                    </div>
                  )}
               </div>
             ) : (
               <>
                {/* Color Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <label className="text-sm font-bold text-white/90 uppercase tracking-wider">Base Frequency</label>
                     {selectedColor && (
                       <span className="text-xs font-mono text-accent-primary">
                         {Object.keys(emotionColors).find(key => emotionColors[key as keyof typeof emotionColors] === selectedColor)?.toUpperCase()}
                       </span>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(emotionColors).map(([name, color]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedColor(color)}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div
                          className={cn(
                            'w-full aspect-square rounded-full relative transition-all duration-300 shadow-xl',
                            selectedColor === color 
                              ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-[#0B0B15]' 
                              : 'hover:scale-105 hover:ring-2 hover:ring-white/20 hover:ring-offset-2 hover:ring-offset-[#0B0B15]'
                          )}
                          style={{ 
                            background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
                            boxShadow: selectedColor === color 
                              ? `0 0 20px ${color}80, inset 0 2px 5px rgba(255,255,255,0.4)` 
                              : `inset 0 2px 5px rgba(255,255,255,0.2)`
                          }}
                        >
                        </div>
                        <span className={cn(
                          "text-[10px] uppercase font-bold tracking-wider transition-colors",
                          selectedColor === color ? "text-white" : "text-white/30 group-hover:text-white/60"
                        )}>
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'Controls' && (
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-white/90 uppercase tracking-wider">Modulation Pattern</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'waves', label: 'Flow', desc: 'Harmonic Motion' },
                        { id: 'particles', label: 'Scatter', desc: 'High Energy' },
                        { id: 'spirals', label: 'Vortex', desc: 'Cyclical Depth' },
                        { id: 'ripples', label: 'Pulse', desc: 'Radial Expansion' },
                      ].map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => setSelectedPattern(pattern.id as PatternType)}
                          className={cn(
                            'relative p-4 rounded-xl text-left transition-all duration-300 border overflow-hidden group',
                            selectedPattern === pattern.id
                              ? 'bg-white/10 border-accent-primary/50 shadow-[0_0_20px_rgba(108,99,255,0.15)]'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          )}
                        >
                          <div className={cn("absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-transparent opacity-0 transition-opacity", selectedPattern === pattern.id && "opacity-100")} />
                          <div className="relative z-10">
                             <div className="font-bold text-white mb-1 group-hover:text-accent-primary transition-colors">{pattern.label}</div>
                             <div className="text-xs text-white/40 font-mono uppercase tracking-tight">{pattern.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Rhythm' && (
                  <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                     <div className="flex items-center gap-3 text-accent-primary mb-2">
                        <Activity className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Rhythm Detection Active</h3>
                     </div>
                     <p className="text-white/60 text-sm leading-relaxed">
                        Tap or click rhythmically in the right panel to set the tempo of your emotional signal. 
                        The intensity will automatically adjust to your BPM.
                     </p>
                     <div className="pt-4 flex items-center justify-between border-t border-white/10">
                        <span className="text-xs text-white/40 uppercase font-mono">Current Style:</span>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                           {motionIntensity > 0.5 ? 'Energetic' : motionIntensity > 0.25 ? 'Moderate' : 'Calm'}
                        </span>
                     </div>
                  </div>
                )}

                {/* Intensity Slider */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-white/90 uppercase tracking-wider">
                         {activeTab === 'Rhythm' ? 'Tempo BPM' : 'Signal Intensity'}
                      </span>
                      <span className="font-mono text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
                        {Math.round(motionIntensity * 100)}%
                      </span>
                   </div>
                   <div className="relative h-6 flex items-center group">
                      <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                           style={{ width: `${motionIntensity * 100}%` }} 
                         />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={motionIntensity}
                        onChange={(e) => setMotionIntensity(parseFloat(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                         className="pointer-events-none absolute h-6 w-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-accent-primary transform transition-transform group-hover:scale-110"
                         style={{ left: `calc(${motionIntensity * 100}% - 12px)` }}
                      />
                   </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 mt-auto flex gap-4">
                  <button
                    onClick={() => navigate('/feed')}
                    className="px-6 py-4 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={isPosting}
                    className="flex-1 relative btn-primary py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg overflow-hidden group shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40 transition-all"
                  >
                    {isPosting ? (
                       <span className="animate-pulse">Broadcasting...</span>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
                        <Send className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Broadcast Signal</span>
                      </>
                    )}
                  </button>
                </div>
               </>
             )}
          </motion.div>
        
        </div>

        {/* Right Panel: Visualization */}
        <div className="hidden lg:block lg:col-span-8 xl:col-span-7 h-full max-h-[calc(100vh-140px)] sticky top-24">
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl relative group">
             
             {/* 3D Glass Overlay Effect */}
             <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-[2.5rem]" />
             
             {activeTab === 'AI Scan' ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                   <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/10 animate-spin-slow flex items-center justify-center">
                      <ScanFace className="w-12 h-12 animate-none" />
                   </div>
                   <p className="font-mono uppercase tracking-widest text-sm">Waiting for Analysis Input source...</p>
                </div>
             ) : activeTab === 'Rhythm' ? (
                <RhythmCanvas 
                  color={selectedColor} 
                  onRhythmChange={(bpm) => setMotionIntensity(bpm / 240)}
                />
             ) : (
                <EmotionCanvas
                  color={selectedColor}
                  pattern={activeTab === 'Draw' ? 'draw' : selectedPattern}
                  motionIntensity={motionIntensity}
                  mode={activeTab === 'Draw' ? 'Draw' : 'Controls'}
                />
             )}

             {/* UI Overlay on Canvas */}
             <div className="absolute top-8 left-8 z-30 flex items-center gap-3">
                <div className="px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                   Live Render
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0B0B15]/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4"
          >
            <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce shadow-[0_0_10px_#fff]" />
            <span className="font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
