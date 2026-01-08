import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings, Moon, Volume2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0.5);
  const [highContrast, setHighContrast] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReducedMotion = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (enabled) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  };

  return (
    <div className="w-full p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Profile Header */}
        <div className="glass-effect rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{user?.name || 'User'}</h1>
              <p className="text-white/60">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="glass-effect rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-bold text-white">Accessibility Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Minimize2 className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">Reduced Motion</p>
                  <p className="text-white/60 text-sm">Minimize animations</p>
                </div>
              </div>
              <button
                onClick={() => handleReducedMotion(!reducedMotion)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  reducedMotion ? 'bg-accent-primary' : 'bg-white/20'
                )}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  animate={{ left: reducedMotion ? '26px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Sound Level */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-white/60" />
                <div className="flex-1">
                  <p className="text-white font-medium">Sound Level</p>
                  <p className="text-white/60 text-sm">Adjust therapy mode volume</p>
                </div>
                <span className="text-white/60 text-sm">{Math.round(soundLevel * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={soundLevel}
                onChange={(e) => setSoundLevel(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-primary 
                         [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">High Contrast</p>
                  <p className="text-white/60 text-sm">Increase visual contrast</p>
                </div>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  highContrast ? 'bg-accent-primary' : 'bg-white/20'
                )}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  animate={{ left: highContrast ? '26px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="glass-effect rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">About Resonance</h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <p>
              Resonance is a space for expressing emotions without words. Share your feelings
              through colors, patterns, and motion.
            </p>
            <p>
              No likes. No comments. No metrics. Just pure emotional expression in a supportive,
              judgment-free environment.
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="w-full glass-effect rounded-2xl p-6 flex items-center justify-center gap-3 
                   text-white hover:bg-white/10 transition-colors group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5 group-hover:text-accent-secondary transition-colors" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
