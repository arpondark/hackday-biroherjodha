import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionPost } from '../emotion/EmotionPost';
import { emotionService, EmotionPost as EmotionPostType } from '@/services/emotionService';
import { Loader } from '@/components/Loader';

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
        <div className="text-center">
          <p className="text-white/60 mb-4">{error}</p>
          <button onClick={loadFeed} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">
          Silent Emotion Feed
        </h1>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No emotions shared yet</p>
            <p className="text-white/40 text-sm mt-2">Be the first to express yourself</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
