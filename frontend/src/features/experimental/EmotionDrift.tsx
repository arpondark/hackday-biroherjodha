import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { emotionColors, EmotionType } from '@/utils/emotions';

const emotions: EmotionType[] = ['calm', 'joy', 'sadness', 'anger', 'fear', 'love', 'peace', 'anxious', 'melancholy'];

export const EmotionDrift: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('calm');
  const [nextEmotion, setNextEmotion] = useState<EmotionType>('peace');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentEmotion(nextEmotion);
          const remaining = emotions.filter(e => e !== nextEmotion);
          setNextEmotion(remaining[Math.floor(Math.random() * remaining.length)]);
          return 0;
        }
        return prev + 0.1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [nextEmotion]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <motion.div
        className="w-full h-full"
        animate={{
          backgroundColor: [emotionColors[currentEmotion], emotionColors[nextEmotion]],
        }}
        transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse'
        }}
        style={{
          filter: 'blur(100px) saturate(0.5)',
          opacity: 0.4
        }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/10 text-9xl font-bold tracking-tighter mix-blend-overlay uppercase select-none">
          {currentEmotion}
        </div>
      </div>

      <div className="absolute bottom-10 left-10 text-white/20 text-xs font-mono">
        Drift: {currentEmotion} → {nextEmotion} ({Math.round(progress)}%)
      </div>
    </div>
  );
};
