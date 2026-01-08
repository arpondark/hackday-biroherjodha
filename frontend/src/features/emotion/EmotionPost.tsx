import React from 'react';
import { motion } from 'framer-motion';
import { EmotionCanvas } from './EmotionCanvas';
import { EmotionPost as EmotionPostType } from '@/services/emotionService';

interface EmotionPostProps {
  post: EmotionPostType;
  onClick?: () => void;
}

export const EmotionPost: React.FC<EmotionPostProps> = ({ post, onClick }) => {
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
      className="emotion-post glass-effect"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full">
        <EmotionCanvas
          color={post.color}
          pattern={post.pattern}
          motionIntensity={post.motionIntensity}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-xs text-white/60">{formatDate(post.createdAt)}</p>
      </div>
    </motion.div>
  );
};
