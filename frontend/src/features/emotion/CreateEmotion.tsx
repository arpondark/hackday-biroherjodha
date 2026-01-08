import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sliders, PenTool, Wand2, Activity, Moon, Info } from 'lucide-react';
import { EmotionCanvas } from './EmotionCanvas';
import { RhythmCanvas } from './RhythmCanvas';
import { SilenceCanvas } from './SilenceCanvas';
import { GenerativeCanvas } from './GenerativeCanvas';
import { DrawCanvas } from './DrawCanvas';
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
};

// Filter patterns to match the design (showing key ones clearly)
const displayPatterns: PatternType[] = ['waves', 'spirals', 'pulse', 'ripples'];

type TabType = 'Controls' | 'Draw' | 'Generate' | 'Rhythm' | 'Silence';

export const CreateEmotion: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(emotionColors.calm);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('waves');
  const [motionIntensity, setMotionIntensity] = useState(0.5);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Controls');
  const [rhythmBpm, setRhythmBpm] = useState(0);

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

  const tabs: { name: TabType; icon: React.ElementType; desc: string }[] = [
    { name: 'Controls', icon: Sliders, desc: 'Classic controls' },
    { name: 'Draw', icon: PenTool, desc: 'Express with drawing' },
    { name: 'Generate', icon: Wand2, desc: 'AI emotion art' },
    { name: 'Rhythm', icon: Activity, desc: 'Tap your heartbeat' },
    { name: 'Silence', icon: Moon, desc: 'Let silence create' },
  ];

  const renderCanvas = () => {
    switch (activeTab) {
      case 'Draw':
        return <DrawCanvas color={selectedColor} onColorChange={setSelectedColor} />;
      case 'Generate':
        return <GenerativeCanvas />;
      case 'Rhythm':
        return <RhythmCanvas color={selectedColor} onRhythmChange={setRhythmBpm} />;
      case 'Silence':
        return <SilenceCanvas color={selectedColor} />;
      default:
        return (
          <EmotionCanvas
            color={selectedColor}
            pattern={selectedPattern}
            motionIntensity={motionIntensity}
          />
        );
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
            
            <div className="flex flex-wrap items-center gap-1 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  title={tab.desc}
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
            
            {/* Tab Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-sm text-white/50"
              >
                {tabs.find(t => t.name === activeTab)?.desc}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Tab-specific controls */}
          <AnimatePresence mode="wait">
            {activeTab === 'Controls' && (
              <motion.div
                key="controls"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
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
                <div>
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
              </motion.div>
            )}

            {activeTab === 'Rhythm' && (
              <motion.div
                key="rhythm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">🎵 Rhythm Mapping</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Tap the canvas to create your rhythm. The system converts your tapping into visual waves.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-accent-primary">{rhythmBpm || '--'}</div>
                      <div className="text-xs text-white/40">BPM</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl">{rhythmBpm < 60 ? '🌙' : rhythmBpm < 120 ? '☀️' : '⚡'}</div>
                      <div className="text-xs text-white/40">Mood</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Rhythm Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(emotionColors).slice(0, 8).map(([name, color]) => (
                      <motion.button
                        key={name}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-10 h-10 rounded-full transition-all',
                          selectedColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0519]'
                        )}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Silence' && (
              <motion.div
                key="silence"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">🌙 Silence Mode</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Be still. Let silence speak. When you stop interacting, the canvas evolves on its own.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>3s: Patterns begin to grow</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>7s: Shapes connect</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                      <span>10s: Auto-creation begins</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Base Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(emotionColors).slice(0, 8).map(([name, color]) => (
                      <motion.button
                        key={name}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-10 h-10 rounded-full transition-all',
                          selectedColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0519]'
                        )}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Draw' && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">✏️ Draw Mode</h3>
                  <p className="text-white/60 text-sm">
                    Express your emotions through free-form drawing. No words needed — just let your feelings flow.
                  </p>
                </div>
                <div className="text-sm text-white/50 space-y-1">
                  <p>💡 Use the toolbar at the bottom to:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Change brush color</li>
                    <li>Adjust brush size</li>
                    <li>Undo strokes</li>
                    <li>Clear canvas</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'Generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">✨ Generative Art</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Select an emotion and watch unique art generate. Interact to reveal hidden meanings.
                  </p>
                  <div className="space-y-2 text-sm text-white/50">
                    <p>🎨 Features:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>6 emotion presets</li>
                      <li>Hidden meaning reveals</li>
                      <li>Export as image</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Preview */}
        <div className="relative flex flex-col h-full bg-[#1A103C] rounded-3xl p-6 border border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white/80 font-medium">
              {activeTab === 'Controls' && 'Live Preview'}
              {activeTab === 'Draw' && 'Drawing Canvas'}
              {activeTab === 'Generate' && 'Generative Art'}
              {activeTab === 'Rhythm' && 'Rhythm Visualizer'}
              {activeTab === 'Silence' && 'Silence Space'}
            </h3>
            <Info className="w-5 h-5 text-white/40" />
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/20 border border-white/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {renderCanvas()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-center mt-6 mb-2">
            <p className="text-white/40 text-sm">Your unique emotional fingerprint</p>
          </div>
          
          {activeTab === 'Controls' && (
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
          )}
        </div>

      </div>
    </div>
  );
};
