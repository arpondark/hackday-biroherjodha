import React, { useRef, useEffect } from 'react';
import { emotionColors } from '@/utils/emotions';

type ExperimentalMode = 'echo' | 'drift' | 'dialogue' | 'misinterpret' | 'stillness' | 'nocenter';

interface ExperimentalCanvasProps {
  color: string;
  mode: ExperimentalMode;
}

export const ExperimentalCanvas: React.FC<ExperimentalCanvasProps> = ({ color, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
      mouseX: 0,
      mouseY: 0,
      history: [] as {x:number, y:number, age:number}[],
      entities: [{x:100,y:100,vx:2,vy:2}, {x:200,y:200,vx:-1,vy:1}],
      driftTime: 0,
      stillness: 0,
      seed: Math.random()
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const render = () => {
        const width = canvas.width;
        const height = canvas.height;
        const state = stateRef.current;

        // Common clear
        if(mode === 'echo') {
            ctx.fillStyle = 'rgba(0,0,0,0.05)'; // Trail effect
            ctx.fillRect(0, 0, width, height);
        } else {
            ctx.clearRect(0,0,width,height);
        }

        switch(mode) {
            case 'echo':
                // Draw current mouse
                ctx.beginPath();
                ctx.arc(state.mouseX, state.mouseY, 10, 0, Math.PI*2);
                ctx.fillStyle = color;
                ctx.fill();
                
                // Draw history as fading echoes
                state.history.push({x: state.mouseX, y: state.mouseY, age: 0});
                if(state.history.length > 50) state.history.shift();
                
                state.history.forEach(p => {
                    p.age++;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 10 * (1 + p.age/50), 0, Math.PI*2);
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = Math.max(0, 1 - p.age/40);
                    ctx.stroke();
                });
                ctx.globalAlpha = 1;
                break;

            case 'drift':
                state.driftTime += 0.005;
                // Color morphing
                const colorKeys = Object.values(emotionColors);
                const colorIndex = Math.floor(state.driftTime) % colorKeys.length;
                const nextColorIndex = (colorIndex + 1) % colorKeys.length;
                const mix = state.driftTime % 1;
                
                // Visualize fluid drift
                for(let i=0; i<10; i++) {
                     const x = width/2 + Math.cos(state.driftTime + i)*100;
                     const y = height/2 + Math.sin(state.driftTime * 0.5 + i)*100;
                     const r = 50 + Math.sin(state.driftTime * 2 + i)*30;
                     
                     ctx.beginPath();
                     ctx.arc(x, y, r, 0, Math.PI*2);
                     ctx.fillStyle = color; // Simplified for now, complex lerp needed for real mix
                     ctx.globalAlpha = 0.3;
                     ctx.fill();
                }
                ctx.globalAlpha = 1;
                break;

            case 'dialogue':
                // Two circles reacting to proximity
                const [e1, e2] = state.entities;
                
                // Move them somewhat randomly or towards center
                e1.x += Math.sin(Date.now() * 0.001) * 2;
                e1.y += Math.cos(Date.now() * 0.002) * 2;
                e2.x = state.mouseX; // User controls one
                e2.y = state.mouseY;

                const dx = e1.x - e2.x;
                const dy = e1.y - e2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Line connecting them, tension based on distance
                ctx.beginPath();
                ctx.moveTo(e1.x, e1.y);
                ctx.lineTo(e2.x, e2.y);
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, 10 - dist/50);
                if(dist < 200) {
                     // Tension vibration
                     ctx.lineTo(e2.x + (Math.random()-0.5)*10, e2.y + (Math.random()-0.5)*10);
                }
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(e1.x, e1.y, 20, 0, Math.PI*2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(e2.x, e2.y, 20, 0, Math.PI*2);
                ctx.fillStyle = color;
                ctx.fill();
                break;

            case 'misinterpret':
                state.driftTime += 0.01;
                // Abstract Rorschach-like symmetry
                ctx.translate(width/2, height/2);
                for(let i=0; i<6; i++) {
                    ctx.rotate(Math.PI/3);
                    ctx.beginPath();
                    ctx.moveTo(0,0);
                    ctx.bezierCurveTo(
                        Math.sin(state.driftTime + i)*100, Math.cos(state.driftTime)*100,
                        Math.cos(state.driftTime - i)*150, Math.sin(state.driftTime)*150,
                        200, 0
                    );
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                ctx.setTransform(1,0,0,1,0,0);
                break;
            
            case 'stillness':
                // Only draw if mouse hasn't moved recently
                if(state.history.length === 0) { // Just using history as "moved recently" flag hack
                    state.stillness++;
                } else {
                    state.stillness = 0;
                    state.history = []; // Clear
                }
                
                if(state.stillness > 60) {
                    const alpha = Math.min(1, (state.stillness - 60) / 100);
                    ctx.globalAlpha = alpha;
                    ctx.font = '30px monospace';
                    ctx.fillStyle = color;
                    ctx.textAlign = 'center';
                    ctx.fillText("Hidden Truth Revealed", width/2, height/2);
                    
                    // Complex growing fractal
                    ctx.beginPath();
                    ctx.arc(width/2, height/2, state.stillness/2, 0, Math.PI*2);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.fillText("Be still...", width/2, height/2);
                }
                ctx.globalAlpha = 1;
                break;

            case 'nocenter':
                // Particles everywhere, no focus
                for(let i=0; i<50; i++) {
                    const x = (Math.sin(i * 132.1 + Date.now()*0.001) * 0.5 + 0.5) * width;
                    const y = (Math.cos(i * 93.7 + Date.now()*0.001) * 0.5 + 0.5) * height;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI*2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                break;
        }

        animationId = requestAnimationFrame(render);
    };
    render();

    const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        stateRef.current.mouseX = e.clientX - rect.left;
        stateRef.current.mouseY = e.clientY - rect.top;
        if(mode === 'stillness') stateRef.current.history.push({x:0, y:0, age:0}); // Touch to reset
    };
    canvas.addEventListener('mousemove', onMove);

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', onMove);
        cancelAnimationFrame(animationId);
    };
  }, [color, mode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
