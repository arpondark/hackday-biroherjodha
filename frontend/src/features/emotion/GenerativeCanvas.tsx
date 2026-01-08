import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';
import { Sparkles, Download, RefreshCw } from 'lucide-react';

interface GenerativeCanvasProps {
  onGenerated?: (imageData: string) => void;
}

// Emotion presets for generation
const emotionPresets = [
  { name: 'Serenity', colors: ['#4A90E2', '#7B68EE', '#2ECC71'], motion: 'slow', pattern: 'waves' },
  { name: 'Passion', colors: ['#E74C3C', '#E91E63', '#F5A623'], motion: 'chaotic', pattern: 'burst' },
  { name: 'Melancholy', colors: ['#7B68EE', '#9B59B6', '#34495E'], motion: 'pulsing', pattern: 'fade' },
  { name: 'Joy', colors: ['#F5A623', '#FFD93D', '#2ECC71'], motion: 'bouncy', pattern: 'sparkle' },
  { name: 'Mystery', colors: ['#1A1A2E', '#9B59B6', '#4A90E2'], motion: 'slow', pattern: 'spiral' },
  { name: 'Energy', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'], motion: 'chaotic', pattern: 'particles' },
];

interface GeneratedArt {
  colors: string[];
  motionStyle: 'slow' | 'chaotic' | 'pulsing' | 'bouncy';
  patternType: string;
  seed: number;
}

export const GenerativeCanvas: React.FC<GenerativeCanvasProps> = ({ onGenerated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentArt, setCurrentArt] = useState<GeneratedArt | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<typeof emotionPresets[0] | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [hiddenShape, setHiddenShape] = useState<'heart' | 'star' | 'infinity' | 'circle'>('heart');

  // Generate new art
  const generateArt = useCallback((emotion?: typeof emotionPresets[0]) => {
    setIsGenerating(true);
    setRevealProgress(0);

    const preset = emotion || emotionPresets[Math.floor(Math.random() * emotionPresets.length)];
    setSelectedEmotion(preset);

    const art: GeneratedArt = {
      colors: preset.colors,
      motionStyle: preset.motion as GeneratedArt['motionStyle'],
      patternType: preset.pattern,
      seed: Math.random() * 10000
    };

    // Hidden shape for reveal feature
    const shapes: ('heart' | 'star' | 'infinity' | 'circle')[] = ['heart', 'star', 'infinity', 'circle'];
    setHiddenShape(shapes[Math.floor(Math.random() * shapes.length)]);

    setTimeout(() => {
      setCurrentArt(art);
      setIsGenerating(false);
    }, 1500);
  }, []);

  // Export canvas as image
  const exportArt = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `emotion-art-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    onGenerated?.(dataUrl);
  }, [onGenerated]);

  // Handle interaction for hidden meaning reveal
  const handleInteraction = useCallback(() => {
    if (revealProgress < 1) {
      setRevealProgress(prev => Math.min(1, prev + 0.02));
    }
  }, [revealProgress]);

  // Canvas animation
  useEffect(() => {
    if (!currentArt) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    let time = 0;
    const { colors, motionStyle, patternType, seed } = currentArt;

    const getSpeed = () => {
      switch (motionStyle) {
        case 'slow': return 0.005;
        case 'chaotic': return 0.03;
        case 'pulsing': return 0.015;
        case 'bouncy': return 0.02;
        default: return 0.01;
      }
    };

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear with slight fade for trails
      ctx.fillStyle = 'rgba(10, 5, 25, 0.08)';
      ctx.fillRect(0, 0, width, height);

      time += getSpeed();

      // Draw based on pattern type
      switch (patternType) {
        case 'waves':
          drawGenerativeWaves(ctx, width, height, colors, time, seed);
          break;
        case 'burst':
          drawBurst(ctx, width, height, colors, time, seed);
          break;
        case 'fade':
          drawFade(ctx, width, height, colors, time, seed);
          break;
        case 'sparkle':
          drawSparkle(ctx, width, height, colors, time, seed);
          break;
        case 'spiral':
          drawGenerativeSpiral(ctx, width, height, colors, time, seed);
          break;
        case 'particles':
          drawGenerativeParticles(ctx, width, height, colors, time, seed);
          break;
      }

      // Draw hidden meaning with reveal
      if (revealProgress > 0) {
        drawHiddenMeaning(ctx, width, height, colors[0], hiddenShape, revealProgress);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentArt, revealProgress, hiddenShape]);

  return (
    <div className="relative w-full h-full">
      {/* Generation Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2">
        {emotionPresets.map((preset) => (
          <motion.button
            key={preset.name}
            onClick={() => generateArt(preset)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedEmotion?.name === preset.name
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-black/30 text-white/60 hover:text-white hover:bg-black/40'
            }`}
            style={{
              background: selectedEmotion?.name === preset.name 
                ? `linear-gradient(135deg, ${preset.colors[0]}40, ${preset.colors[1]}40)` 
                : undefined
            }}
          >
            {preset.name}
          </motion.button>
        ))}
      </div>

      {/* Canvas */}
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleInteraction}
        onMouseMove={handleInteraction}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Generating Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-12 h-12 text-accent-primary" />
              </motion.div>
              <p className="mt-4 text-white/80">Generating emotion...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Art State */}
      {!currentArt && !isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            onClick={() => generateArt()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl text-white font-medium flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Emotion Art
          </motion.button>
        </div>
      )}

      {/* Action Buttons */}
      {currentArt && !isGenerating && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <motion.button
            onClick={() => generateArt()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={exportArt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-accent-primary/80 backdrop-blur-sm rounded-full text-white hover:bg-accent-primary"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Hidden Meaning Hint */}
      {currentArt && revealProgress < 0.3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 text-xs text-white/40"
        >
          Interact to reveal hidden meaning...
        </motion.div>
      )}

      {/* Reveal Progress */}
      {revealProgress > 0 && revealProgress < 1 && (
        <motion.div className="absolute bottom-4 left-4 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent-primary"
            initial={{ width: 0 }}
            animate={{ width: `${revealProgress * 100}%` }}
          />
        </motion.div>
      )}
    </div>
  );
};

// Pattern Drawing Functions
function drawGenerativeWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  for (let c = 0; c < colors.length; c++) {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = hexToRgba(colors[c], 0.3 - i * 0.05);
      ctx.lineWidth = 3;

      for (let x = 0; x < width; x += 3) {
        const y = height / 2 +
          Math.sin(x * 0.008 + time + seed + c * 2 + i * 0.3) * 80 +
          Math.sin(x * 0.015 + time * 0.7 + c) * 40;
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

function drawBurst(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const rays = 24;

  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + time;
    const length = 100 + Math.sin(time * 3 + i + seed) * 150;
    
    const gradient = ctx.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    gradient.addColorStop(0, hexToRgba(colors[i % colors.length], 0.8));
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function drawFade(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  const layers = 8;
  for (let i = 0; i < layers; i++) {
    const y = (height / layers) * i + Math.sin(time + i + seed) * 20;
    const alpha = 0.3 - (i / layers) * 0.2 + Math.sin(time * 0.5 + i) * 0.1;
    
    const gradient = ctx.createLinearGradient(0, y, width, y);
    gradient.addColorStop(0, hexToRgba(colors[i % colors.length], alpha));
    gradient.addColorStop(0.5, hexToRgba(colors[(i + 1) % colors.length], alpha * 0.5));
    gradient.addColorStop(1, hexToRgba(colors[(i + 2) % colors.length], alpha));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, width, height / layers + 20);
  }
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  const sparkles = 30;
  for (let i = 0; i < sparkles; i++) {
    const x = (Math.sin(seed + i * 0.5) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed + i * 0.7) * 0.5 + 0.5) * height;
    const size = 3 + Math.sin(time * 4 + i) * 3;
    const alpha = 0.5 + Math.sin(time * 3 + i) * 0.3;

    // Star shape
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time + i);
    
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size * 2, Math.sin(angle) * size * 2);
    }
    ctx.strokeStyle = hexToRgba(colors[i % colors.length], alpha);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

function drawGenerativeSpiral(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  const centerX = width / 2;
  const centerY = height / 2;

  for (let c = 0; c < colors.length; c++) {
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(colors[c], 0.5);
    ctx.lineWidth = 2;

    for (let angle = 0; angle < Math.PI * 10; angle += 0.05) {
      const radius = angle * 8 + Math.sin(time + c) * 10;
      const x = centerX + Math.cos(angle + time + c * 2 + seed) * radius;
      const y = centerY + Math.sin(angle + time + c * 2 + seed) * radius;

      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawGenerativeParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  time: number,
  seed: number
) {
  const particles = 50;
  for (let i = 0; i < particles; i++) {
    const baseX = ((seed * 100 + i * 73) % width);
    const baseY = ((seed * 50 + i * 47) % height);
    
    const x = baseX + Math.sin(time * 2 + i) * 30;
    const y = baseY + Math.cos(time * 1.5 + i) * 30;
    const size = 4 + Math.sin(time + i) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(colors[i % colors.length], 0.6);
    ctx.fill();

    // Connect nearby particles
    for (let j = i + 1; j < particles; j++) {
      const otherX = ((seed * 100 + j * 73) % width) + Math.sin(time * 2 + j) * 30;
      const otherY = ((seed * 50 + j * 47) % height) + Math.cos(time * 1.5 + j) * 30;
      const dist = Math.sqrt((x - otherX) ** 2 + (y - otherY) ** 2);

      if (dist < 80) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(otherX, otherY);
        ctx.strokeStyle = hexToRgba(colors[i % colors.length], 0.2 * (1 - dist / 80));
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

// Hidden meaning shape reveal
function drawHiddenMeaning(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  shape: 'heart' | 'star' | 'infinity' | 'circle',
  progress: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = 60 * progress;
  const alpha = progress * 0.6;

  ctx.save();
  ctx.translate(centerX, centerY);

  ctx.beginPath();

  switch (shape) {
    case 'heart':
      // Heart shape
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.5, -size, size * 0.3, 0, size);
      ctx.bezierCurveTo(size, size * 0.3, size, -size * 0.5, 0, size * 0.3);
      break;

    case 'star':
      // 5-point star
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;

    case 'infinity':
      // Infinity symbol
      for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = size * Math.cos(t) / (1 + Math.sin(t) ** 2);
        const y = size * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) ** 2);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      break;

    case 'circle':
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      break;
  }

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = hexToRgba(color, alpha * 1.2);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}
