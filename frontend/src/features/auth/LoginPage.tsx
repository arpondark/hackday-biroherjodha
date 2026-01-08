import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';
import { Sparkles } from 'lucide-react';

// Floating emotion bubble
const EmotionBubble: React.FC<{ delay: number; emoji: string; x: number; duration: number }> = ({ delay, emoji, x, duration }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    initial={{ y: '100vh', x: `${x}vw`, opacity: 0, scale: 0 }}
    animate={{ 
      y: '-10vh', 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0.5],
      rotate: [0, 10, -10, 0],
    }}
    transition={{ 
      duration, 
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  >
    {emoji}
  </motion.div>
);

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const emojis = ['💜', '💙', '💚', '🧡', '💛', '✨', '🌊', '🔥', '🌸', '🌙'];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);
      if (credentialResponse.credential) {
        await login(credentialResponse.credential);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-darker relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Mesh gradient */}
        <div className="absolute inset-0 mesh-bg opacity-40" />
        
        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(108, 99, 255, 0.4) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(255, 101, 132, 0.3) 0%, transparent 70%)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[60px]"
          style={{ background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating emotion bubbles */}
        {emojis.map((emoji, i) => (
          <EmotionBubble 
            key={i} 
            emoji={emoji} 
            delay={i * 1.5} 
            x={10 + (i * 8)} 
            duration={8 + Math.random() * 4} 
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        {/* Card glow */}
        <motion.div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary blur-xl opacity-30"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="relative aurora-glass rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-accent-primary/50 blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-primary p-0.5"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-full h-full rounded-full bg-background-darker" />
              </motion.div>
              {/* Core */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-accent-primary via-white to-accent-secondary bg-clip-text text-transparent">
                Resonance
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-white/60 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Express emotions without words
            </motion.p>
          </div>

          {/* Login section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex flex-col items-center gap-5">
              {/* Divider */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
                <span className="text-white/50 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign in to begin
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
              </div>
              
              {/* Google Login */}
              <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="pill"
                />
              </div>
            </div>

            {/* Footer text */}
            <motion.div 
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-white/30 text-xs">A space for silent emotional expression</p>
              <p className="text-white/40 text-xs mt-2 font-medium">No words. No metrics. Just feelings.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
