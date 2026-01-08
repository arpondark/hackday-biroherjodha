import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionPost } from '../emotion/EmotionPost';
import { emotionService, EmotionPost as EmotionPostType } from '@/services/emotionService';
import { Loader } from '@/components/Loader';
import { Users, Waves, Heart, Sparkles, RefreshCw, X, Volume2 } from 'lucide-react';
import { EmotionCanvas } from '../emotion/EmotionCanvas';
import { cn } from '@/utils/cn';

// Emotion interpretation based on color and pattern
const interpretEmotion = (color: string, pattern: string, intensity: number) => {
  // Color-based feeling
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

  // Pattern-based energy
  const patternEnergy: Record<string, string> = {
    waves: 'flowing',
    particles: 'scattered',
    spirals: 'centered',
    ripples: 'expanding',
  };

  // Intensity-based state
  const intensityState = intensity > 0.7 ? 'intense' : intensity > 0.4 ? 'moderate' : 'gentle';

  return {
    feeling: colorFeeling,
    energy: patternEnergy[pattern] || 'unique',
    state: intensityState,
    emoji: getEmotionEmoji(colorFeeling),
  };
};

const getEmotionEmoji = (feeling: string): string => {
  const emojiMap: Record<string, string> = {
    Passionate: '🔥',
    Warm: '🌅',
    Hopeful: '🌱',
    Peaceful: '🍃',
    Deep: '🌊',
    Calm: '💙',
    Joyful: '✨',
    Creative: '🎨',
    Serene: '🌸',
    Reflective: '🌙',
  };
  return emojiMap[feeling] || '💫';
};

export const EmotionFeed: React.FC = () => {
  const [posts, setPosts] = useState<EmotionPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<EmotionPostType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'immersive'>('grid');

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
      <div className="min-h-screen pt-48 flex items-center justify-center">
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
    <div className="min-h-screen pt-40 pb-8 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-accent-primary" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Emotional Echoes
            </h1>
          </div>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            A space where emotions are felt, not explained. Each signal represents someone's 
            inner world — colors, patterns, and movement that speak without words.
          </p>
          
          {/* Stats & Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="glass-effect px-4 py-2 rounded-full flex items-center gap-2">
              <Waves className="w-4 h-4 text-accent-secondary" />
              <span className="text-white/80 text-sm">{posts.length} signals shared</span>
            </div>
            <button
              onClick={loadFeed}
              className="glass-effect px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
              <span className="text-white/80 text-sm">Refresh</span>
            </button>
            <div className="glass-effect p-1 rounded-full flex">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm transition-all',
                  viewMode === 'grid' ? 'bg-accent-primary text-white' : 'text-white/60 hover:text-white'
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('immersive')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm transition-all',
                  viewMode === 'immersive' ? 'bg-accent-primary text-white' : 'text-white/60 hover:text-white'
                )}
              >
                Immersive
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="glass-effect rounded-2xl p-4 max-w-2xl mx-auto">
            <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              How to Read Emotions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-1" />
                <span className="text-white/60">Warm colors = Passion/Energy</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-1" />
                <span className="text-white/60">Cool colors = Calm/Depth</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-1" />
                <span className="text-white/60">Green tones = Growth/Hope</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-1" />
                <span className="text-white/60">Purple/Pink = Creative/Love</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-white/50">
              <span>🌊 Waves = Flowing state</span>
              <span>✨ Particles = Scattered thoughts</span>
              <span>🌀 Spirals = Centered focus</span>
              <span>💫 Ripples = Expanding awareness</span>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <motion.div 
            className="text-center py-20 glass-effect rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Heart className="w-16 h-16 text-accent-primary/50 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No emotions shared yet</p>
            <p className="text-white/40 text-sm mt-2">Be the first to express yourself</p>
          </motion.div>
        ) : viewMode === 'immersive' ? (
          /* Immersive View - Large scrollable cards */
          <div className="space-y-8">
            {posts.map((post, index) => {
              const interpretation = interpretEmotion(post.color, post.pattern, post.motionIntensity);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="glass-effect rounded-3xl overflow-hidden"
                >
                  <div className="relative h-80 md:h-96">
                    <EmotionCanvas
                      color={post.color}
                      pattern={post.pattern}
                      motionIntensity={post.motionIntensity}
                      interactive={false}
                    />
                    {/* Overlay with interpretation */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{interpretation.emoji}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {interpretation.feeling} Energy
                          </h3>
                          <p className="text-white/60 text-sm">
                            A {interpretation.state}, {interpretation.energy} emotional state
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: post.color }}
                          />
                          <span className="text-white/50 text-xs">Color tone</span>
                        </div>
                        <div className="text-white/50 text-xs">
                          Pattern: {post.pattern}
                        </div>
                        <div className="text-white/50 text-xs">
                          Intensity: {Math.round(post.motionIntensity * 100)}%
                        </div>
                        <div className="text-white/40 text-xs ml-auto">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EmotionPost 
                  post={post} 
                  onClick={() => setSelectedPost(post)}
                  showInterpretation
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl glass-effect rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="h-80 relative">
                <EmotionCanvas
                  color={selectedPost.color}
                  pattern={selectedPost.pattern}
                  motionIntensity={selectedPost.motionIntensity}
                  interactive={true}
                />
              </div>
              
              <div className="p-6">
                {(() => {
                  const interpretation = interpretEmotion(
                    selectedPost.color, 
                    selectedPost.pattern, 
                    selectedPost.motionIntensity
                  );
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{interpretation.emoji}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {interpretation.feeling} Energy
                          </h3>
                          <p className="text-white/60">
                            A {interpretation.state}, {interpretation.energy} emotional expression
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="glass-effect p-3 rounded-xl text-center">
                          <div 
                            className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-white/20"
                            style={{ backgroundColor: selectedPost.color }}
                          />
                          <span className="text-white/60 text-xs">Color</span>
                        </div>
                        <div className="glass-effect p-3 rounded-xl text-center">
                          <div className="text-2xl mb-1">
                            {selectedPost.pattern === 'waves' && '🌊'}
                            {selectedPost.pattern === 'particles' && '✨'}
                            {selectedPost.pattern === 'spirals' && '🌀'}
                            {selectedPost.pattern === 'ripples' && '💫'}
                          </div>
                          <span className="text-white/60 text-xs capitalize">{selectedPost.pattern}</span>
                        </div>
                        <div className="glass-effect p-3 rounded-xl text-center">
                          <div className="text-2xl mb-1">
                            {selectedPost.motionIntensity > 0.7 ? '⚡' : selectedPost.motionIntensity > 0.4 ? '💨' : '🍃'}
                          </div>
                          <span className="text-white/60 text-xs">{Math.round(selectedPost.motionIntensity * 100)}% intensity</span>
                        </div>
                      </div>
                      
                      <p className="text-white/50 text-sm text-center">
                        Shared on {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
