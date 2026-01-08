import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Heart, Users, Zap, ArrowRight, Volume2, Palette, Moon } from 'lucide-react';

// Floating particle component
const FloatingParticle: React.FC<{ delay: number; x: number; y: number }> = ({ delay, x, y }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-accent-primary/60"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
    style={{ left: `${x}%`, top: `${y}%` }}
  />
);

// Animated ring component
const PulseRing: React.FC<{ delay: number; size: number }> = ({ delay, size }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-primary/20"
    initial={{ width: 0, height: 0, opacity: 0.8 }}
    animate={{
      width: size,
      height: size,
      opacity: 0,
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / 50);
      mouseY.set((clientY - innerHeight / 2) / 50);
      setMousePosition({ x: clientX, y: clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Palette,
      title: 'Express Without Words',
      description: 'Transform your emotions into living, breathing visual art',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Connect Silently',
      description: 'Feel the emotional resonance of others around the world',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Volume2,
      title: 'Healing Frequencies',
      description: 'Immerse in therapeutic soundscapes for inner peace',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Moon,
      title: 'Experimental Lab',
      description: 'Explore unique ways to visualize your inner world',
      color: 'from-orange-500 to-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background-darker relative overflow-y-auto overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-bg opacity-50" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Floating orbs that follow mouse slightly */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(108, 99, 255, 0.3) 0%, transparent 70%)',
            x: smoothX,
            y: smoothY,
            left: '20%',
            top: '20%',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 101, 132, 0.25) 0%, transparent 70%)',
            x: useTransform(smoothX, v => -v * 0.5),
            y: useTransform(smoothY, v => -v * 0.5),
            right: '10%',
            bottom: '20%',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, transparent 70%)',
            x: useTransform(smoothX, v => v * 0.3),
            y: useTransform(smoothY, v => v * 0.3),
            left: '50%',
            top: '60%',
          }}
        />

        {/* Pulse rings */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2">
          <PulseRing delay={0} size={400} />
          <PulseRing delay={1} size={400} />
          <PulseRing delay={2} size={400} />
          <PulseRing delay={3} size={400} />
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.3}
            x={Math.random() * 100}
            y={50 + Math.random() * 50}
          />
        ))}

        {/* Animated gradient line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(108, 99, 255, 0.5), rgba(255, 101, 132, 0.5), transparent)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto text-center">
          {/* Logo with glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mb-8"
          >
            {/* Glow behind logo */}
            <motion.div
              className="absolute inset-0 rounded-full bg-accent-primary/50 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-primary p-1 animate-glow">
              <div className="w-full h-full rounded-full bg-background-darker flex items-center justify-center">
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>

          {/* Title with enhanced gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-accent-primary via-white to-accent-secondary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-shift">
              Resonance
            </span>
          </motion.h1>

          {/* Animated tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <p className="text-2xl md:text-3xl text-white/90 font-light">
              Express emotions{' '}
              <span className="relative inline-block">
                <span className="gradient-text font-medium">without words</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </span>
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A revolutionary platform where feelings transcend language. Share your emotional state through 
            visual expressions, connect with others on a deeper level, and discover 
            <span className="text-accent-primary"> inner peace</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary 
                       text-white font-semibold text-lg overflow-hidden transition-all duration-300
                       hover:shadow-2xl hover:shadow-accent-primary/50 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Begin Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            <motion.button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full glass-effect text-white font-medium text-lg
                       hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Features
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-sm">Scroll to discover</span>
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 rounded-full bg-white/40 mt-2"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl mx-auto py-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            <span className="gradient-text">Feel. Express. Connect.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-center mb-12 max-w-xl mx-auto"
          >
            Discover unique ways to explore and share your emotional landscape
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                >
                  {/* Card glow */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 
                                 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
                  
                  <div className="relative glass-effect rounded-2xl p-6 h-full
                               border-white/10 group-hover:border-white/20 transition-all duration-300">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-5`}>
                      <div className="w-full h-full rounded-xl bg-background-darker flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-accent-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover arrow */}
                    <motion.div
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight className="w-5 h-5 text-white/40" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Philosophy Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl mx-auto py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="aurora-glass rounded-3xl p-10 md:p-16"
          >
            <motion.div
              className="text-5xl mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌊
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              "Sometimes words fail, but emotions never lie."
            </h3>
            <p className="text-white/60 text-lg leading-relaxed">
              In a world of constant noise, Resonance offers a sanctuary of silent expression. 
              Here, your feelings become art, your silence speaks volumes, and every emotion 
              finds its visual voice.
            </p>
            <div className="divider mt-8 mb-8 max-w-xs mx-auto" />
            <p className="text-white/40 text-sm">
              No words. No metrics. Just feelings.
            </p>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full py-8 text-center border-t border-white/5"
        >
          <p className="text-white/30 text-sm">
            Made with 💜 for those who feel deeply
          </p>
        </motion.footer>
      </div>
    </div>
  );
};
