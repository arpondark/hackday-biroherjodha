import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { EmotionPost } from '../emotion/EmotionPost';
import { emotionService, EmotionPost as EmotionPostType } from '@/services/emotionService';
import { Loader } from '@/components/Loader';

export const EmotionHistory: React.FC = () => {
  const [posts, setPosts] = useState<EmotionPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await emotionService.getHistory();
      setPosts(data);
    } catch (err) {
      setError('Failed to load emotion history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (posts: EmotionPostType[]) => {
    const groups: { [key: string]: EmotionPostType[] } = {};
    
    posts.forEach((post) => {
      const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(post);
    });

    return groups;
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error}</p>
          <button onClick={loadHistory} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedPosts = groupByDate(posts);

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-accent-primary" />
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Emotion Timeline
          </h1>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No emotions recorded yet</p>
            <p className="text-white/40 text-sm mt-2">Start expressing yourself to build your timeline</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPosts).map(([date, datePosts], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <h2 className="text-lg font-medium text-white/80">{date}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {datePosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <EmotionPost post={post} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm">
              {posts.length} emotion{posts.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
