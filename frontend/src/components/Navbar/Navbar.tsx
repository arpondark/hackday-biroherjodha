import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Heart, History, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/feed', icon: Layers, label: 'Feed' },
  { path: '/therapy', icon: Heart, label: 'Therapy' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  // Don't show navbar on login and landing pages
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar - Left Side */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 glass-effect flex-col items-center py-8 gap-4 z-50">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary" />
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item group relative',
                isActive && 'active'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={cn(
                  'w-6 h-6 relative z-10 transition-colors',
                  isActive ? 'text-accent-primary' : 'text-white/60 group-hover:text-white'
                )}
              />
              <span className="text-xs text-white/60 group-hover:text-white relative z-10">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Navbar - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect flex items-center justify-around py-4 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative',
                isActive && 'active'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-navbar-indicator"
                  className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={cn(
                  'w-6 h-6 relative z-10 transition-colors',
                  isActive ? 'text-accent-primary' : 'text-white/60'
                )}
              />
              <span
                className={cn(
                  'text-xs relative z-10 transition-colors',
                  isActive ? 'text-white' : 'text-white/60'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
