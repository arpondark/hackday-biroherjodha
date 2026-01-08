import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layers, Heart, History, User, Mic2, Wind, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const navItems = [
  { path: '/dashboard', icon: Mic2, label: 'Express' },
  { path: '/silence', icon: Wind, label: 'Silence' },
  { path: '/therapy', icon: Heart, label: 'Therapy' },
  { path: '/feed', icon: Layers, label: 'Connect' },
  { path: '/calm', icon: Volume2, label: 'Calm' },
  { path: '/history', icon: History, label: 'History' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  // Don't show navbar on login and landing pages
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#130a2a]/90 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wider text-white">RESONANCE</h1>
            <p className="text-xs text-white/40 tracking-widest mt-1 uppercase">Your Daily Emotional Echo — Express, Connect, Remember</p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    'relative px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300',
                    isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/25"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="text-sm font-medium relative z-10">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
