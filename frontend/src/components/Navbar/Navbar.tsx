import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layers, Heart, History, User, Mic2, Wind, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const navItems = [
  { path: '/dashboard', icon: Mic2, label: 'Express' },
  { path: '/silence', icon: Wind, label: 'Silence' },
  { path: '/experiments', icon: FlaskConical, label: 'Lab' },
  { path: '/therapy', icon: Heart, label: 'Therapy' },
  { path: '/feed', icon: Layers, label: 'Connect' },
  { path: '/calm', icon: User, label: 'Calm' }, // Placeholder route
  { path: '/history', icon: History, label: 'History' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  // Don't show navbar on login and landing pages
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">RESONANCE</h1>
            <span className="text-[10px] text-white/40 tracking-[0.2em] font-medium uppercase mt-1">Experimental Lab</span>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 group',
                  isActive ? 'text-white' : 'text-white/50 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn(
                  "w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-accent-primary" : "text-white/40 group-hover:text-white/70"
                )} />
                <span className="text-sm font-medium relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-4">
          <NavLink 
            to="/profile" 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <User className="w-5 h-5 text-white/70" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};
