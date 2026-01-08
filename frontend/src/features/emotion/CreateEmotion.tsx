import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sliders, PenTool, Wand2, Activity, Info } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('Controls');

  const [showSuccess, setShowSuccess] = useState(false);

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
      setShowSuccess(true);
      setTimeout(() => {
        setIsPosting(false);
        setShowSuccess(false);
        navigate('/feed');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to post emotion:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen pt-48 pb-8 px-8 container mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-160px)]">
        
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6">
          
          {/* Header & Tabs */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Create Your Signal</h2>
            
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
              {[
                { name: 'Controls', icon: Sliders },
                { name: 'Draw', icon: PenTool },
                { name: 'Generate', icon: Wand2 },
                { name: 'Rhythm', icon: Activity },
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
            
            {/* Intensity Slider (moved up to match 'Controls' context roughly) */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
               <motion.div 
                 className="h-full bg-accent-primary" 
                 initial={{ width: '50%' }}
                 animate={{ width: `${motionIntensity * 100}%` }}
               />
            </div>
          </div>

          {/* Conditional Controls based on Tab */}
          {activeTab === 'Controls' && (
            <>
              {/* Color Grid */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Choose Your Emotion Color</label>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(emotionColors).slice(0, 8).map(([name, color]) => (
                    <motion.button
                      key={name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'aspect-square rounded-2xl transition-all relative overflow-hidden',
                        selectedColor === color && 'ring-4 ring-white shadow-xl scale-105 z-10'
                      )}
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90 opacity-0 hover:opacity-100 transition-opacity bg-black/20 capitalize z-20">
                        {name}
                      </span>
                      {selectedColor === color && (
                        <motion.div
                          layoutId="color-indicator"
                          className="absolute inset-0 rounded-2xl border-4 border-white z-10"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pattern Cards */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Choose Motion Pattern</label>
                <div className="grid grid-cols-2 gap-4">
                  {displayPatterns.map((pattern) => (
                    <button
                      key={pattern}
                      onClick={() => setSelectedPattern(pattern)}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all border border-transparent',
                        selectedPattern === pattern
                          ? 'bg-gradient-to-br from-[#7B61FF] to-[#6C63FF]/50 border-white/20 shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border-white/5'
                      )}
                    >
                      <div className="font-bold text-white mb-1">{patternDetails[pattern].label}</div>
                      <div className="text-xs text-white/60">{patternDetails[pattern].desc}</div>
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
                  {Object.values(emotionColors).slice(0, 12).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        selectedColor === color ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
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
                    {Object.values(emotionColors).slice(0, 6).map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all",
                          selectedColor === color ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
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
        </div>

        {/* Right Column: Preview */}
        <div className="relative flex flex-col h-full bg-[#1A103C] rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white/80 font-medium">Live Preview</h3>
            <Info className="w-5 h-5 text-white/40" />
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/20 border border-white/5">
             <EmotionCanvas
               color={selectedColor}
               pattern={selectedPattern}
               motionIntensity={motionIntensity}
               mode={activeTab as any}
             />
          </div>

          <div className="text-center mt-6 mb-2">
            <p className="text-white/40 text-sm">Your unique emotional fingerprint</p>
          </div>
          
           {/* Floating Post Button inside Preview area contextually or just bottom right */}
           <motion.button
              onClick={handlePost}
              disabled={isPosting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl text-white font-bold shadow-lg shadow-accent-primary/25 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isPosting ? 'Posting Signal...' : 'Share Signal'}
            </motion.button>
        </div>

      </div>

      {/* Success Modal */}
      {showSuccess && (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-[#1A103C] p-8 rounded-3xl border border-white/10 shadow-2xl text-center max-w-sm mx-4">
                <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4 text-accent-primary">
                   <Send className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Signal Sent!</h3>
                <p className="text-white/60 mb-6">Your emotion was successfully shared to the feed.</p>
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-white/40">
                    Visible in Feed
                </div>
            </div>
        </motion.div>
      )}

    </div>
  );
};
