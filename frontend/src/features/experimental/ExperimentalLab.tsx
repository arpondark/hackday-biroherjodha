import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingEmotion } from './BreathingEmotion';
import { SilenceZones } from './SilenceZones';
import { HiddenPatterns } from './HiddenPatterns';
import { BehavioralMusic } from './BehavioralMusic';
import { MemoryEcho } from './MemoryEcho';
import { EmotionDrift } from './EmotionDrift';
import { UnspokenDialogue } from './UnspokenDialogue';
import { MisinterpretationEngine } from './MisinterpretationEngine';
import { StillnessRecognition } from './StillnessRecognition';
import { DecentralizedEmotion } from './DecentralizedEmotion';
import { ChevronRight, ChevronLeft, FlaskConical } from 'lucide-react';

const experiments = [
  { name: 'Emotion Breathing', component: <BreathingEmotion emotion="calm" /> },
  { name: 'Silence Zones', component: <SilenceZones /> },
  { name: 'Hidden Patterns', component: <HiddenPatterns /> },
  { name: 'Behavioral Music', component: <BehavioralMusic /> },
  { name: 'Memory Echo', component: <MemoryEcho /> },
  { name: 'Emotion Drift', component: <EmotionDrift /> },
  { name: 'Unspoken Dialogue', component: <UnspokenDialogue /> },
  { name: 'Misinterpretation', component: <MisinterpretationEngine /> },
  { name: 'Stillness Recognition', component: <StillnessRecognition /> },
  { name: 'Without Center', component: <DecentralizedEmotion /> },
];

export const ExperimentalLab: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUI, setShowUI] = useState(true);

  const next = () => setCurrentIndex((prev) => (prev + 1) % experiments.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + experiments.length) % experiments.length);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="w-full h-full"
        >
          {experiments[currentIndex].component}
        </motion.div>
      </AnimatePresence>

      <div 
        className="absolute inset-x-0 bottom-0 p-8 flex items-end justify-between pointer-events-none"
        onMouseEnter={() => setShowUI(true)}
      >
        <AnimatePresence>
          {showUI && (
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 20, opacity: 0 }}
               className="flex items-center gap-6 pointer-events-auto"
            >
              <button onClick={prev} className="p-2 text-white/50 hover:text-white transition-colors">
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Experiment {currentIndex + 1}</div>
                <div className="text-white font-medium text-lg uppercase tracking-tighter">{experiments[currentIndex].name}</div>
              </div>

              <button onClick={next} className="p-2 text-white/50 hover:text-white transition-colors">
                <ChevronRight className="w-8 h-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
           onClick={() => setShowUI(!showUI)}
           className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 pointer-events-auto transition-all"
        >
           <FlaskConical className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-8 left-8 text-white/20 select-none flex items-center gap-2">
         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
         <span className="text-[10px] uppercase tracking-[0.3em]">Experimental Lab</span>
      </div>
    </div>
  );
};
