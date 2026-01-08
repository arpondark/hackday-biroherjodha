import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 bg-background-darker border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">RESONANCE</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Exploring the intersection of human behavior, digital silence, and emotional resonance.
            </p>
          </div>

          {/* Contributors */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Lead Architect</h4>
              <p className="text-white/60 font-medium">SHAZAN ARPON</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Operations</h4>
              <p className="text-white/60 font-medium">RAFIUR RAHMAN</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Systems</h4>
              <p className="text-white/60 font-medium">SAZZAD SAZID</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20 uppercase tracking-widest leading-none">
            Built for HackDay 2026. Experimental Build v0.9
          </p>
          <div className="text-[10px] text-white/20 uppercase tracking-widest leading-none">
            © {new Date().getFullYear()} Resonance. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
