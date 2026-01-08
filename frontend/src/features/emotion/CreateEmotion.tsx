import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sliders, PenTool, Wand2, Activity, Info, Camera, ScanFace } from 'lucide-react';
import Webcam from 'react-webcam';
import { EmotionCanvas } from './EmotionCanvas';
import { emotionColors, PatternType } from '@/utils/emotions';
import { emotionService } from '@/services/emotionService';
import { cn } from '@/utils/cn';

// Pattern metadata for the UI cards
const patternDetails: Record<PatternType, { label: string; desc: string }> = {
  waves: { label: 'Wave', desc: 'Flowing, rhythmic' },
  particles: { label: 'Particles', desc: 'Scattered, energetic' },
  spirals: { label: 'Swirl', desc: 'Circular, spiraling' },
  ripples: { label: 'Ripple', desc: 'Expanding, gentle' },
  circles: { label: 'Circles', desc: 'Looping, connection' },
  flow: { label: 'Flow', desc: 'Steady stream' },
  pulse: { label: 'Pulse', desc: 'Steady, heartbeat' },
  draw: { label: 'Draw', desc: 'Freeform expression' },
  rhythm: { label: 'Rhythm', desc: 'Visual beat' },
};

// Filter patterns to match the design (showing key ones clearly)
const displayPatterns: PatternType[] = ['waves', 'spirals', 'pulse', 'ripples', 'particles'];

export const CreateEmotion: React.FC = () => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string>(emotionColors.calm);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('waves');
  const [motionIntensity, setMotionIntensity] = useState(0.5);
  const [isPosting, setIsPosting] = useState(false);
  // State for AI Scan
  const [isScanning, setIsScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedMood, setDetectedMood] = useState<{name: string, confidence: number} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Controls');

  const webcamRef = useRef<Webcam>(null);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDetectedMood(null);
    setAnalyzing(false);

    let progress = 0;
    // Slower scan: 100 steps * 50ms = 5000ms (5 seconds)
    const interval = setInterval(() => {
      progress += 1;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        startAnalysis();
      }
    }, 50); 
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    // Fake "Processing" delay
    setTimeout(() => {
        finalizeScan();
    }, 1500);
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

    // Give user time to see the result before posting (2s)
    setTimeout(async () => {
      setToastMessage("Auto-posting signal...");
      
      try {
        await emotionService.createEmotion({
           color: randomMood.color,
           pattern: randomMood.pattern,
           motionIntensity: 0.7,
        });

        // Show Success Toast and Redirect
        setToastMessage("Signal posted! Opening therapy...");
        setTimeout(() => {
          navigate('/therapy', { state: { suggestedMode: randomMood.therapy, reason: `AI detected: ${randomMood.name}` } });
        }, 2000);

      } catch (e) {
        console.error("Auto post failed", e);
        setToastMessage("Failed to post signal.");
        setTimeout(() => setToastMessage(null), 3000);
        setIsScanning(false);
      }
    }, 2000);
  };
 
  const handlePost = async () => {
    setIsPosting(true);
    try {
      // Use activeTab as pattern for Draw/Rhythm, otherwise selectedPattern
      let patternToSave = selectedPattern;
      if (activeTab === 'Draw') patternToSave = 'draw' as PatternType; 
      if (activeTab === 'Rhythm') patternToSave = 'rhythm' as PatternType;

      await emotionService.createEmotion({
        color: selectedColor,
        pattern: patternToSave,
        motionIntensity,
      });

      // Show success feedback
      setToastMessage("Signal posted successfully!");
      setTimeout(() => {
        setIsPosting(false);
        setToastMessage(null);
        navigate('/feed');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to post emotion:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full pb-12 px-8 container mx-auto relative pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-160px)]">
        
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6">
          
          {/* Header & Tabs */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Create Your Signal</h2>
            
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit border border-white/10 flex-wrap">
              {[
                { name: 'Controls', icon: Sliders },
                { name: 'Draw', icon: PenTool },
                { name: 'Generate', icon: Wand2 },
                { name: 'Rhythm', icon: Activity },
                { name: 'AI Scan', icon: ScanFace },
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={cn(
                    'px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all',
                    activeTab === tab.name 
                      ? 'bg-accent-primary text-white shadow-lg' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
            
            {activeTab !== 'AI Scan' && (
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                 <motion.div 
                   className="h-full bg-accent-primary" 
                   initial={{ width: '50%' }}
                   animate={{ width: `${motionIntensity * 100}%` }}
                 />
              </div>
            )}
          </div>

          {/* AI SCAN TAB CONTENT */}
          {activeTab === 'AI Scan' && (
            <div className="flex-1 flex flex-col">
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden flex-1 min-h-[400px] flex flex-col items-center justify-center">
                  {!isScanning && !detectedMood ? (
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Camera className="w-10 h-10 text-white/80" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Mood Detection</h3>
                        <p className="text-white/60 max-w-sm mx-auto">
                          Let our AI analyze your facial expressions to detect your current emotional state and recommend therapy.
                        </p>
                      </div>
                      <button 
                        onClick={startScan}
                        className="flex items-center gap-2 mx-auto bg-accent-primary hover:bg-accent-primary/80 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-accent-primary/25"
                      >
                        <ScanFace className="w-5 h-5" /> Start Scan
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                       <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full h-full object-cover"
                          videoConstraints={{ facingMode: "user" }}
                        />
                       
                       {/* Scanning Overlay */}
                       {isScanning && !detectedMood && !analyzing && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                            <div className="w-64 h-64 border-2 border-accent-primary/50 rounded-full relative">
                               <motion.div 
                                 className="absolute top-0 left-0 right-0 h-1 bg-accent-primary shadow-[0_0_15px_rgba(108,99,255,0.8)]"
                                 animate={{ top: ['0%', '100%', '0%'] }}
                                 transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                               />
                            </div>
                            <div className="mt-8 text-white font-mono text-lg tracking-wider animate-pulse">
                              SCANNING FACE... {Math.round(scanProgress)}%
                            </div>
                         </div>
                       )}

                       {/* Analyzing Overlay */}
                       {analyzing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                             <div className="flex gap-2 mb-4">
                                {[1,2,3].map(i => (
                                   <motion.div 
                                     key={i}
                                     className="w-3 h-3 bg-accent-secondary rounded-full"
                                     animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                     transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                   />
                                ))}
                             </div>
                             <div className="text-white font-mono tracking-widest text-sm">ANALYZING EXPRESSIONS...</div>
                          </div>
                       )}

                       {/* Result Overlay simulated */}
                       {detectedMood && !analyzing && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-[#1A103C] p-8 rounded-3xl border border-white/10 shadow-2xl"
                            >
                               <div className="text-sm text-white/40 uppercase tracking-widest mb-2">Mood Detected</div>
                               <div className="text-4xl font-bold text-white mb-2">{detectedMood.name}</div>
                               <div className="text-accent-primary font-mono mb-6">{detectedMood.confidence}% Confidence</div>
                               
                               <div className="space-y-3">
                                  <div className="text-xs text-white/40">Preparing Signal...</div>
                                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                       className="h-full bg-accent-secondary"
                                       initial={{ width: 0 }}
                                       animate={{ width: '100%' }}
                                       transition={{ duration: 2 }} // Matches the timeout
                                    />
                                  </div>
                               </div>
                            </motion.div>
                         </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'Controls' && (
            <>
              {/* Color Grid */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">
                  Base Color
                  {selectedColor && (
                    <span className="ml-2 text-accent-primary capitalize">
                      {Object.keys(emotionColors).find(key => emotionColors[key as keyof typeof emotionColors] === selectedColor)}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(emotionColors).map(([name, color]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(color)}
                      className="group flex flex-col items-center gap-2"
                      title={name}
                    >
                      <div
                        className={cn(
                          'w-full aspect-square rounded-full transition-all duration-300 relative',
                          selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-black ring-white' : 'group-hover:scale-105 group-hover:opacity-80'
                        )}
                        style={{ backgroundColor: color }}
                      >
                         {selectedColor === color && (
                            <motion.div 
                              layoutId="check"
                              className="absolute inset-0 flex items-center justify-center text-black/50"
                            >
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>
                         )}
                      </div>
                      <span className={cn(
                        "text-xs capitalize transition-colors",
                        selectedColor === color ? "text-white font-medium" : "text-white/50 group-hover:text-white/80"
                      )}>
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern Cards */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Movement Pattern</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'waves', label: 'Flow', desc: 'Gentle, continuous movement' },
                    { id: 'particles', label: 'Scatter', desc: 'Dispersed, energetic particles' },
                    { id: 'spirals', label: 'Vortex', desc: 'Cyclical, deep motion' },
                    { id: 'ripples', label: 'Pulse', desc: 'Rhythmic, outward waves' },
                  ].map((pattern) => (
                    <button
                      key={pattern.id}
                      onClick={() => setSelectedPattern(pattern.id as PatternType)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all duration-300',
                        selectedPattern === pattern.id
                          ? 'bg-white/10 border-white/20 shadow-lg'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                      )}
                    >
                      <div className="font-medium text-white mb-1">{pattern.label}</div>
                      <div className="text-xs text-white/40">{pattern.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Draw' && (
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-white/80 mb-4">Express yourself freely directly on the canvas.</p>
                <label className="text-sm font-medium text-white/80 block mb-3">Brush Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(emotionColors).map(([name, color]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-full aspect-square rounded-full transition-all duration-300 relative',
                        selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-black ring-white' : 'hover:scale-105 hover:opacity-80'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Rhythm' && (
             <div className="space-y-6">
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                 <p className="text-white/80 mb-4">Visualize the rhythm of your emotions.</p>
                 <label className="text-sm font-medium text-white/80 block mb-3">Rhythm Color</label>
                  <div className="grid grid-cols-6 gap-3 mb-6">
                    {Object.entries(emotionColors).map(([name, color]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-full aspect-square rounded-full transition-all duration-300 relative",
                          selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-offset-black ring-white" : "hover:scale-105 hover:opacity-80"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                 
                 <div className="flex justify-between text-sm text-white/60 mb-2">
                   <span>Rhythm Tempo</span>
                   <span>{Math.round(motionIntensity * 120)} BPM</span>
                 </div>
               </div>
             </div>
          )}

          {/* Intensity/Speed Control (Shared) */}
          <div className="mt-auto">
             <div className="flex justify-between text-sm text-white/60 mb-2">
               <span>{activeTab === 'Rhythm' ? 'Tempo' : 'Intensity'}</span>
               <span>{Math.round(motionIntensity * 100)}%</span>
             </div>
             <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={motionIntensity}
              onChange={(e) => setMotionIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-primary"
            />
          </div>

          {/* Action Area */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <button
               onClick={() => navigate('/feed')}
               className="text-sm text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {activeTab !== 'AI Scan' && (
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Share Signal
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="hidden lg:block relative sticky top-24 h-[calc(100vh-160px)]">
           {activeTab === 'AI Scan' ? (
             <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-8 text-center text-white/40">
                <div className="space-y-4">
                  <ScanFace className="w-16 h-16 mx-auto opacity-20" />
                  <p>AI Analysis View Active</p>
                </div>
             </div>
           ) : (
             <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <EmotionCanvas
                  color={selectedColor}
                  pattern={activeTab === 'Draw' ? 'draw' : activeTab === 'Rhythm' ? 'rhythm' : selectedPattern}
                  motionIntensity={motionIntensity}
                  mode={activeTab === 'Draw' ? 'Draw' : activeTab === 'Rhythm' ? 'Rhythm' : 'Controls'}
                />
                <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <span className="text-white/90 text-sm font-medium">Live Preview</span>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1A103C] text-white px-6 py-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-4"
        >
          <div className="w-3 h-3 bg-accent-secondary rounded-full animate-bounce" />
          <span className="font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
};
