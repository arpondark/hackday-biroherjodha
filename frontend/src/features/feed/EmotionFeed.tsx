import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionPost } from '../emotion/EmotionPost';
import { emotionService, EmotionPost as EmotionPostType } from '@/services/emotionService';
import { Loader } from '@/components/Loader';
import { Activity } from 'lucide-react';

export const EmotionFeed: React.FC = () => {
  const [posts, setPosts] = useState<EmotionPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await emotionService.getFeed();
      setPosts(data);
    } catch (err) {
      setError('Failed to load emotion feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <p className="text-white/60 mb-6 font-mono">{error}</p>
          <button onClick={loadFeed} className="btn-primary px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-12 relative">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none -z-10 bg-gradient-to-b from-accent-primary/10 to-transparent opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-white/10 rounded-lg">
                 <Activity className="w-5 h-5 text-accent-secondary" />
               </div>
               <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Global Signals</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              Silent Feed
            </h1>
          </div>
          
          <div className="text-right hidden md:block">
             <div className="text-2xl font-bold text-white">{posts.length}</div>
             <div className="text-sm text-white/40 font-mono uppercase tracking-widest">Active Signals</div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <Activity className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/60 text-xl font-light mb-2">The ether is quiet.</p>
            <p className="text-white/30 text-sm font-mono uppercase tracking-widest">Be the first to transmit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                className="perspective-1000"
              >
                <EmotionPost post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
