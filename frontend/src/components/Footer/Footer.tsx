import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 text-center text-white/60 text-xs tracking-wider bg-[#800000]">
      <div className="flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 mb-2">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-accent-primary fill-current" />
          <span>by Resonance Team</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-white/60">MD SHAZAN MAHMUD ARPON</span>
            <span className="text-[10px] uppercase">Lead Developer</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="font-bold text-white/60">RAFIUR RAHMAN</span>
            <span className="text-[10px] uppercase">Developer</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="font-bold text-white/60">MD SAZZAD HOSSAIN SAZID</span>
            <span className="text-[10px] uppercase">Developer</span>
          </div>
        </div>
        
        <div className="mt-4 text-[10px] opacity-60">
          © {new Date().getFullYear()} Resonance. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
