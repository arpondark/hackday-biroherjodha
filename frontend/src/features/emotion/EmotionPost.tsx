import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EmotionCanvas } from './EmotionCanvas';
import { EmotionPost as EmotionPostType } from '@/services/emotionService';

interface EmotionPostProps {
  post: EmotionPostType;
  onClick?: () => void;
}

export const EmotionPost: React.FC<EmotionPostProps> = ({ post, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/signal/${post.id}`);
    }
  };

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
      className="group relative w-full aspect-square rounded-3xl overflow-hidden cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glass Container */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 shadow-xl group-hover:shadow-2xl z-10 rounded-3xl" />
      
      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0 scale-110 group-hover:scale-125 transition-transform duration-700">
        <EmotionCanvas
          color={post.color}
          pattern={post.pattern}
          motionIntensity={post.motionIntensity}
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <div className="self-end">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
         </div>
         
         <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex justify-between items-center text-xs text-white/80 font-mono tracking-wide">
               <span className="uppercase">{post.pattern}</span>
               <span className="opacity-60">{formatDate(post.createdAt)}</span>
            </div>
         </div>
      </div>
      
      {/* Default State (Bottom Bar) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 group-hover:opacity-0 transition-opacity duration-300">
         <div className="flex items-center gap-2">
            <div className="h-[2px] w-8 bg-white/50 rounded-full" />
            <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Signal</span>
         </div>
      </div>

    </motion.div>
  );
};
