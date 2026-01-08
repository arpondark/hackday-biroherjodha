import React from 'react';
import { motion } from 'framer-motion';

export const DecentralizedEmotion: React.FC = () => {
    const grid = Array.from({ length: 15 * 15 });

    return (
        <div className="w-full h-screen bg-zinc-950 p-12 overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-15 gap-4">
                {grid.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        animate={{
                            backgroundColor: ['#18181b', '#3f3f46', '#18181b'],
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 10
                        }}
                    />
                ))}
            </div>
            
            <div className="absolute inset-0 pointer-events-none border-[100px] border-zinc-950 opacity-80" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-radial-gradient from-transparent to-zinc-950 pointer-events-none" />
            
            <div className="absolute top-10 text-center text-[10px] text-white/5 uppercase tracking-[1em]">
                Decentralized Focus
            </div>
        </div>
    );
};
