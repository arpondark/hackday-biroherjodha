import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, Eye, Music, Waves, Users, Shuffle, 
  CircleDashed, Info, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BreathingCanvas } from '../emotion/BreathingCanvas';
import { HiddenPatternsCanvas } from '../emotion/HiddenPatternsCanvas';
import { ThoughtMusicCanvas } from '../emotion/ThoughtMusicCanvas';
import { ExperimentalCanvas } from '../emotion/ExperimentalCanvas';
import { emotionColors } from '@/utils/emotions';
import { cn } from '@/utils/cn';

type ExperimentMode = 
  | 'breathing' 
  | 'hidden-patterns' 
  | 'thought-music'
  | 'drift'
  | 'dialogue'
  | 'misinterpret'
  | 'nocenter';

interface ExperimentInfo {
  id: ExperimentMode;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const experiments: ExperimentInfo[] = [
  {
    id: 'breathing',
    name: 'Emotion Breathing',
    icon: Wind,
    description: 'Colors pulse like breathing based on your emotion. Anxiety quickens, calm deepens.',
    color: '#4A90E2'
  },
  {
    id: 'hidden-patterns',
    name: 'Hidden Patterns',
    icon: Eye,
    description: 'Look closely. After patient observation, feelings emerge from decoration.',
    color: '#E91E63'
  },
  {
    id: 'thought-music',
    name: 'Thought Music',
    icon: Music,
    description: 'Music from movement, pause, and stillness. No notes—just textures of being.',
    color: '#F5A623'
  },
  {
    id: 'drift',
    name: 'Emotion Drift',
    icon: Waves,
    description: 'Emotions slowly morph into each other. Joy bleeds into peace into melancholy.',
    color: '#2ECC71'
  },
  {
    id: 'dialogue',
    name: 'Unspoken Dialogue',
    icon: Users,
    description: 'Two entities communicate through proximity and tension. Stillness brings them closer.',
    color: '#E74C3C'
  },
  {
    id: 'misinterpret',
    name: 'Misinterpretation',
    icon: Shuffle,
    description: 'Same pattern, different feeling each time. No two views are alike.',
    color: '#00BCD4'
  },
  {
    id: 'nocenter',
    name: 'No Center',
    icon: CircleDashed,
    description: 'Emotion without focal point. Presence distributed everywhere equally.',
    color: '#FF6B6B'
  }
];

export const ExperimentalPage: React.FC = () => {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentMode>('breathing');
  const [selectedColor, setSelectedColor] = useState<string>(emotionColors.calm);
  const [, setSelectedEmotion] = useState<string>('calm');

  const currentExperiment = experiments.find(e => e.id === activeExperiment);

  const renderCanvas = () => {
    switch (activeExperiment) {
      case 'breathing':
        return <BreathingCanvas color={selectedColor} />;
      case 'hidden-patterns':
        return <HiddenPatternsCanvas color={selectedColor} />;
      case 'thought-music':
        return <ThoughtMusicCanvas color={selectedColor} />;
      case 'drift':
        return <ExperimentalCanvas color={selectedColor} mode="drift" />;
      case 'dialogue':
        return <ExperimentalCanvas color={selectedColor} mode="dialogue" />;
      case 'misinterpret':
        return <ExperimentalCanvas color={selectedColor} mode="misinterpret" />;
      case 'nocenter':
        return <ExperimentalCanvas color={selectedColor} mode="nocenter" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link 
          to="/create" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Create
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-2">Experimental Lab</h1>
        <p className="text-white/60 max-w-2xl">
          Explore unconventional ways to express and experience emotion. These experiments push 
          the boundaries of interaction, silence, and perception.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Experiment Selection Grid */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-semibold text-white/80 mb-4">Choose Experiment</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {experiments.map((exp) => (
              <motion.button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-4 rounded-xl text-left transition-all border',
                  activeExperiment === exp.id
                    ? 'bg-white/10 border-white/20 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                )}
              >
                <exp.icon 
                  className="w-6 h-6 mb-2" 
                  style={{ color: exp.color }}
                />
                <div className="font-medium text-white text-sm">{exp.name}</div>
              </motion.button>
            ))}
          </div>

          {/* Color Selection */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-white/80">Base Color</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(emotionColors).slice(0, 8).map(([name, color]) => (
                <motion.button
                  key={name}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedEmotion(name);
                  }}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all',
                    selectedColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0519]'
                  )}
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-8">
          <div className="bg-[#1A103C] rounded-3xl p-6 border border-white/5 shadow-2xl min-h-[600px] flex flex-col">
            {/* Experiment Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {currentExperiment && (
                    <currentExperiment.icon 
                      className="w-5 h-5" 
                      style={{ color: currentExperiment.color }}
                    />
                  )}
                  {currentExperiment?.name}
                </h3>
                <p className="text-white/50 text-sm mt-1 max-w-md">
                  {currentExperiment?.description}
                </p>
              </div>
              <Info className="w-5 h-5 text-white/30" />
            </div>

            {/* Canvas */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/30 border border-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeExperiment}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {renderCanvas()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Experiment Tips */}
            <div className="mt-4 p-4 bg-white/5 rounded-xl">
              <h4 className="text-sm font-medium text-white/70 mb-2">Tips</h4>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeExperiment}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-white/50 space-y-1"
                >
                  {activeExperiment === 'breathing' && (
                    <>
                      <p>• Watch the shape expand and contract with breath</p>
                      <p>• Different emotions have different breathing patterns</p>
                      <p>• Anxiety creates irregular, rapid breathing</p>
                    </>
                  )}
                  {activeExperiment === 'hidden-patterns' && (
                    <>
                      <p>• Look closely at the decorative patterns</p>
                      <p>• Keep your gaze still for several seconds</p>
                      <p>• Hidden meanings will reveal themselves</p>
                    </>
                  )}
                  {activeExperiment === 'thought-music' && (
                    <>
                      <p>• Hold and move to create sound textures</p>
                      <p>• Movement speed affects pitch and intensity</p>
                      <p>• Stillness creates deep bass tones</p>
                    </>
                  )}
                  {activeExperiment === 'drift' && (
                    <>
                      <p>• Watch emotions slowly blend into each other</p>
                      <p>• Colors shift and merge over time</p>
                      <p>• No single emotion exists in isolation</p>
                    </>
                  )}
                  {activeExperiment === 'dialogue' && (
                    <>
                      <p>• Two entities communicate through space</p>
                      <p>• Stillness brings them closer together</p>
                      <p>• Movement creates tension between them</p>
                    </>
                  )}
                  {activeExperiment === 'misinterpret' && (
                    <>
                      <p>• The same pattern feels different each time</p>
                      <p>• Perception shapes reality</p>
                      <p>• Refresh to see a new interpretation</p>
                    </>
                  )}
                  {activeExperiment === 'nocenter' && (
                    <>
                      <p>• There is no focal point</p>
                      <p>• Presence is distributed everywhere</p>
                      <p>• Feel the emotion without location</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
