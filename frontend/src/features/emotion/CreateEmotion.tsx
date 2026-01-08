import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { EmotionCanvas } from './EmotionCanvas';
import { emotionColors, emotionPatterns, PatternType } from '@/utils/emotions';
import { emotionService } from '@/services/emotionService';
import { cn } from '@/utils/cn';

export const CreateEmotion: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(emotionColors.calm);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('waves');
  const [motionIntensity, setMotionIntensity] = useState(0.6);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    setIsPosting(true);
    try {
      await emotionService.createEmotion({
        color: selectedColor,
        pattern: selectedPattern,
        motionIntensity,
      });
      // Show success feedback
      setTimeout(() => {
        setIsPosting(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to post emotion:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row">
      {/* Canvas Area */}
      <div className="flex-1 relative">
        <EmotionCanvas
          color={selectedColor}
          pattern={selectedPattern}
          motionIntensity={motionIntensity}
        />
        
        {/* Post Button */}
        <motion.button
          onClick={handlePost}
          disabled={isPosting}
          className="absolute bottom-8 right-8 btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
          {isPosting ? 'Posting...' : 'Post Emotion'}
        </motion.button>
      </div>

      {/* Controls Panel */}
      <div className="w-full md:w-80 glass-effect p-6 space-y-6 overflow-y-auto">
        <h2 className="text-2xl font-bold gradient-text">Express Yourself</h2>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">Emotion Color</label>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(emotionColors).map(([name, color]) => (
              <motion.button
                key={name}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'w-full aspect-square rounded-xl transition-all relative',
                  selectedColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-background-dark'
                )}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {selectedColor === color && (
                  <motion.div
                    layoutId="color-indicator"
                    className="absolute inset-0 rounded-xl border-2 border-white"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pattern Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">Visual Pattern</label>
          <div className="grid grid-cols-2 gap-3">
            {emotionPatterns.map((pattern) => (
              <motion.button
                key={pattern}
                onClick={() => setSelectedPattern(pattern)}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize',
                  selectedPattern === pattern
                    ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                    : 'glass-effect text-white/80 hover:bg-white/10'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {pattern}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Motion Intensity */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">
            Motion Intensity: {Math.round(motionIntensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={motionIntensity}
            onChange={(e) => setMotionIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-primary 
                     [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/60 leading-relaxed">
            Create a visual representation of your current emotion. No words needed—just colors,
            patterns, and motion.
          </p>
        </div>
      </div>
    </div>
  );
};
