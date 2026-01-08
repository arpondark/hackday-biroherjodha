import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { SilenceCanvas } from './SilenceCanvas';

export const SilencePage: React.FC = () => {
  const [, setSilenceState] = useState<'active' | 'creating' | 'evolved'>('active');

  return (
    <div className="relative w-full min-h-screen bg-[#050508] overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute inset-0 z-0">
        <SilenceCanvas 
          color="#6C63FF" 
          onSilenceStateChange={setSilenceState}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full min-h-screen container mx-auto flex flex-col items-center justify-center py-16 px-4 pointer-events-none">
        <div className="max-w-2xl w-full text-center space-y-12">
          
          {/* Header */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-xl"
            >
              <Wind className="w-8 h-8 text-accent-secondary" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">Enter the Silence</h1>
            <p className="text-white/60 drop-shadow-md">Take a moment to disconnect and breathe.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
