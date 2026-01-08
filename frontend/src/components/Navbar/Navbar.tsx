import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Heart, History, Mic2, Sparkles, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const navItems = [
  { path: '/dashboard', icon: Mic2, label: 'Express', color: 'from-purple-500 to-pink-500' },
  { path: '/experimental', icon: Sparkles, label: 'Lab', color: 'from-yellow-500 to-orange-500' },
  { path: '/therapy', icon: Heart, label: 'Therapy', color: 'from-pink-500 to-red-500' },
  { path: '/feed', icon: Layers, label: 'Connect', color: 'from-blue-500 to-cyan-500' },
  { path: '/history', icon: History, label: 'History', color: 'from-green-500 to-emerald-500' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show navbar on login and landing pages
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled 
          ? 'bg-background-darker/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-background-darker/80 backdrop-blur-md border-b border-white/5'
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo */}
            <div className="relative w-10 h-10">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0.5 rounded-full bg-background-darker flex items-center justify-center">
                <motion.div
                  className="w-4 h-4 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-wider gradient-text-static">RESONANCE</h1>
              <p className="text-[10px] text-white/40 tracking-widest uppercase -mt-0.5">Feel. Express. Connect.</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 p-1.5 rounded-2xl glass-effect">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <motion.div
                    className={cn(
                      'relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300',
                      isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className={cn(
                          'absolute inset-0 rounded-xl',
                          'bg-gradient-to-r',
                          item.color
                        )}
                        style={{ opacity: 0.9 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="text-sm font-medium relative z-10 hidden md:block">{item.label}</span>
                    
                    {/* Tooltip for mobile */}
                    <AnimatePresence>
                      {!isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/60 
                                   bg-background-light px-2 py-1 rounded whitespace-nowrap md:hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </NavLink>
              );
            })}
          </nav>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-xl glass-effect hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfile(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-xl p-2 z-50"
                  >
                    <NavLink
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(108, 99, 255, 0.5), rgba(255, 101, 132, 0.5), transparent)',
        }}
        animate={{ opacity: scrolled ? 0.8 : 0.3 }}
      />
    </motion.header>
  );
};
