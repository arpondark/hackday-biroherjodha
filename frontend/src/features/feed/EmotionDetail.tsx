import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import { EmotionCanvas } from '../emotion/EmotionCanvas';
import { emotionService, EmotionPost as EmotionPostType } from '@/services/emotionService';
import { Loader } from '@/components/Loader';

export const EmotionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<EmotionPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEmotion(id);
    }
  }, [id]);

  const loadEmotion = async (emotionId: string) => {
    try {
      setLoading(true);
      const data = await emotionService.getEmotionById(emotionId);
      setPost(data);
    } catch (err) {
      setError('Failed to load emotion signal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader fullScreen />;

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Signal Not Found</h2>
        <p className="text-white/60 mb-8">{error || "This signal seems to have faded away."}</p>
        <button onClick={() => navigate('/feed')} className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 md:px-8 container mx-auto">
      <motion.button
        onClick={() => navigate('/feed')}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        whileHover={{ x: -4 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
        {/* Main Canvas Display - Takes up 2/3 space on large screens */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl"
        >
          <EmotionCanvas
            color={post.color}
            pattern={post.pattern}
            motionIntensity={post.motionIntensity}
          />
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
             <h1 className="text-3xl font-bold text-white mb-2 capitalize">{post.pattern} Signal</h1>
             <p className="text-white/60 font-mono text-sm">{formatDate(post.createdAt)}</p>
          </div>
        </motion.div>

        {/* Info / Interaction Panel - Takes up 1/3 space */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A103C] p-8 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">Signal Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/80">Pattern</span>
                  <span className="text-white font-medium capitalize">{post.pattern}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/80">Base Color</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs uppercase">{post.color}</span>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: post.color }} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/80">Intensity</span>
                   <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-accent-primary" style={{ width: `${post.motionIntensity * 100}%` }} />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm leading-relaxed italic">
                "Each signal is a unique imprint of a moment in time, captured in color and motion."
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 group">
              <Heart className="w-5 h-5 text-accent-secondary group-hover:scale-110 transition-transform" />
              <span>Connect</span>
            </button>
            <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
