import React, { useRef, useEffect } from 'react';

interface ThoughtMusicCanvasProps {
  color: string;
}

export const ThoughtMusicCanvas: React.FC<ThoughtMusicCanvasProps> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Audio context (simulated visual for music)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Low frequency drone
    oscillator.type = 'sine';
    oscillator.frequency.value = 100;
    gainNode.gain.value = 0;
    
    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    // gainNode.connect(audioContext.destination); // Muted by default to avoid annoyance, visual only logic
    oscillator.start();

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{x: number, y: number, life: number}> = [];

    let moveSpeed = 0;

    const animate = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Visualize 'sound' based on movement speed
      const bars = 20;
      const barWidth = canvas.width / bars;
      
      for(let i=0; i<bars; i++) {
         const height = (Math.sin(i * 0.5 + Date.now() * 0.005) + 1) * 50 * (moveSpeed * 0.1 + 0.5);
         
         ctx.fillStyle = color;
         ctx.globalAlpha = 0.5;
         ctx.fillRect(i * barWidth, canvas.height/2 - height/2, barWidth - 5, height);
         
         // Reflection
         ctx.globalAlpha = 0.2;
         ctx.fillRect(i * barWidth, canvas.height/2 + height/2, barWidth - 5, height * 0.5);
      }
      
      // Particles for mouse
      particles.forEach((p, index) => {
          p.life -= 0.02;
          p.y -= 1;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = p.life;
          ctx.fill();
          
          if(p.life <= 0) particles.splice(index, 1);
      });
      ctx.globalAlpha = 1;

      moveSpeed *= 0.95; // Decay
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        moveSpeed += 1;
        particles.push({x, y, life: 1});
        
        // Modulate audio param (visual rep)
        const freq = 100 + (x / canvas.width) * 400;
        oscillator.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.1);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', handleMouseMove);
        oscillator.stop();
        audioContext.close();
    };
  }, [color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
