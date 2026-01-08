import React from 'react';
import { motion } from 'framer-motion';
import { EmotionCanvas } from './EmotionCanvas';
import { EmotionPost as EmotionPostType } from '@/services/emotionService';

interface EmotionPostProps {
  post: EmotionPostType;
  onClick?: () => void;
  showInterpretation?: boolean;
}

// Emotion interpretation helper
const interpretEmotion = (color: string, pattern: string, intensity: number) => {
  const hue = parseInt(color.replace('#', ''), 16);
  const r = (hue >> 16) & 255;
  const g = (hue >> 8) & 255;
  const b = hue & 255;
  
  let colorFeeling = '';
  if (r > g && r > b) colorFeeling = intensity > 0.6 ? 'Passionate' : 'Warm';
  else if (g > r && g > b) colorFeeling = intensity > 0.6 ? 'Hopeful' : 'Peaceful';
  else if (b > r && b > g) colorFeeling = intensity > 0.6 ? 'Deep' : 'Calm';
  else if (r > 200 && g > 200) colorFeeling = 'Joyful';
  else if (r > 200 && b > 200) colorFeeling = 'Creative';
  else if (g > 200 && b > 200) colorFeeling = 'Serene';
  else colorFeeling = 'Reflective';

  const emojiMap: Record<string, string> = {
    Passionate: '🔥', Warm: '🌅', Hopeful: '🌱', Peaceful: '🍃',
    Deep: '🌊', Calm: '💙', Joyful: '✨', Creative: '🎨',
    Serene: '🌸', Reflective: '🌙',
  };

  const patternEmoji: Record<string, string> = {
    waves: '🌊', particles: '✨', spirals: '🌀', ripples: '💫',
  };

  return {
    feeling: colorFeeling,
    emoji: emojiMap[colorFeeling] || '💫',
    patternEmoji: patternEmoji[pattern] || '✨',
    intensity: intensity > 0.7 ? 'intense' : intensity > 0.4 ? 'moderate' : 'gentle',
  };
};

export const EmotionPost: React.FC<EmotionPostProps> = ({ post, onClick, showInterpretation = false }) => {
  const interpretation = interpretEmotion(post.color, post.pattern, post.motionIntensity);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      className="emotion-post glass-effect cursor-pointer group"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full">
        <EmotionCanvas
          color={post.color}
          pattern={post.pattern}
          motionIntensity={post.motionIntensity}
          interactive={false}
        />
      </div>
      
      {/* Enhanced overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {showInterpretation ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{interpretation.emoji}</span>
              <span className="text-white font-medium text-sm">{interpretation.feeling}</span>
              <span className="text-white/40 text-xs ml-auto">{interpretation.patternEmoji}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-white/30"
                  style={{ backgroundColor: post.color }}
                />
                <span className="text-white/50 text-xs capitalize">{post.pattern}</span>
              </div>
              <p className="text-xs text-white/40">{formatDate(post.createdAt)}</p>
            </div>
            {/* Intensity bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${post.motionIntensity * 100}%` }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{interpretation.emoji}</span>
              <span className="text-white/80 text-sm">{interpretation.feeling}</span>
            </div>
            <p className="text-xs text-white/60">{formatDate(post.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Hover hint */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-white/60 bg-black/50 px-2 py-1 rounded-full">
          Click to feel
        </span>
      </div>
    </motion.div>
  );
};
