import React from 'react';
import { motion } from 'framer-motion';
import { EmotionType, emotionColors } from '@/utils/emotions';

interface BreathingEmotionProps {
  emotion: EmotionType;
}

const breathingPatterns: Record<EmotionType, { duration: number; scale: number[]; opacity: number[] }> = {
  calm: {
    duration: 8,
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.6, 0.3],
  },
  joy: {
    duration: 4,
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
  },
  sadness: {
    duration: 12,
    scale: [1, 1.05, 1],
    opacity: [0.2, 0.4, 0.2],
  },
  anger: {
    duration: 2,
    scale: [1, 1.3, 1],
    opacity: [0.6, 1, 0.6],
  },
  fear: {
    duration: 1.5,
    scale: [1, 1.05, 1.2, 1],
    opacity: [0.4, 0.9, 0.4],
  },
  love: {
    duration: 6,
    scale: [1, 1.15, 1],
    opacity: [0.4, 0.7, 0.4],
  },
  peace: {
    duration: 10,
    scale: [1, 1.25, 1],
    opacity: [0.2, 0.5, 0.2],
  },
  neutral: {
    duration: 7,
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.5, 0.3],
  },
  anxious: {
    duration: 1.2, // Fast uneven pulse
    scale: [1, 1.1, 0.95, 1.15, 1],
    opacity: [0.5, 0.8, 0.6, 0.9, 0.5],
  },
  melancholy: {
    duration: 9,
    scale: [1, 1.08, 1],
    opacity: [0.25, 0.45, 0.25],
  },
};

export const BreathingEmotion: React.FC<BreathingEmotionProps> = ({ emotion }) => {
  const pattern = breathingPatterns[emotion] || breathingPatterns.neutral;
  const color = emotionColors[emotion];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <motion.div
        animate={{
          scale: pattern.scale,
          opacity: pattern.opacity,
        }}
        transition={{
          duration: pattern.duration,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {/* No labels as per requirement */}
      </div>
    </div>
  );
};
