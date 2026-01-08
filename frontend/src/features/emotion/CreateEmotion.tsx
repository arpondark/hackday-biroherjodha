import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sliders, PenTool, Wand2, Activity, Info } from 'lucide-react';
import { EmotionCanvas } from './EmotionCanvas';
import { emotionColors, emotionPatterns, PatternType } from '@/utils/emotions';
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
};

// Filter patterns to match the design (showing key ones clearly)
const displayPatterns: PatternType[] = ['waves', 'spirals', 'pulse', 'ripples'];

export const CreateEmotion: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(emotionColors.calm);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('waves');
  const [motionIntensity, setMotionIntensity] = useState(0.5);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('Controls');

  const handlePost = async () => {
    setIsPosting(true);
    try {
      await emotionService.createEmotion({
        color: selectedColor,
        pattern: selectedPattern,
        motionIntensity,
      });
      setTimeout(() => {
        setIsPosting(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to post emotion:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen pt-48 pb-8 px-8 container mx-auto">
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

          {/* Intensity Control */}
          <div className="mt-auto">
             <div className="flex justify-between text-sm text-white/60 mb-2">
               <span>Intensity Level</span>
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
    </div>
  );
};
