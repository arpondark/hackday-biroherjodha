import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '@/utils/emotions';
import { Eraser, Undo } from 'lucide-react';

interface DrawCanvasProps {
  color: string;
  onColorChange?: (color: string) => void;
}

interface DrawPoint {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: DrawPoint[];
  color: string;
  width: number;
}

const brushColors = [
  '#4A90E2', '#F5A623', '#7B68EE', '#E74C3C', 
  '#9B59B6', '#E91E63', '#2ECC71', '#FFD93D'
];

export const DrawCanvas: React.FC<DrawCanvasProps> = ({ color, onColorChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [brushColor, setBrushColor] = useState(color);
  const [brushWidth, setBrushWidth] = useState(8);
  const [showPalette, setShowPalette] = useState(false);

  // Handle drawing start
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number, pressure = 0.5;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      // @ts-ignore - force property exists on some touch events
      pressure = e.touches[0].force || 0.5;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    setIsDrawing(true);
    setCurrentStroke([{ x, y, pressure }]);
  }, []);

  // Handle drawing
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number, pressure = 0.5;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      // @ts-ignore
      pressure = e.touches[0].force || 0.5;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    setCurrentStroke(prev => [...prev, { x, y, pressure }]);
  }, [isDrawing]);

  // Handle drawing end
  const endDrawing = useCallback(() => {
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, {
        points: currentStroke,
        color: brushColor,
        width: brushWidth
      }]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  }, [currentStroke, brushColor, brushWidth]);

  // Undo last stroke
  const undoStroke = useCallback(() => {
    setStrokes(prev => prev.slice(0, -1));
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
  }, []);

  // Change brush color
  const handleColorChange = useCallback((newColor: string) => {
    setBrushColor(newColor);
    onColorChange?.(newColor);
    setShowPalette(false);
  }, [onColorChange]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();

    let time = 0;

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 5, 25, 1)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw subtle ambient background
      drawAmbientBackground(ctx, width, height, brushColor, time);

      // Draw all completed strokes
      strokes.forEach(stroke => {
        drawSmoothStroke(ctx, stroke.points, stroke.color, stroke.width);
      });

      // Draw current stroke
      if (currentStroke.length > 0) {
        drawSmoothStroke(ctx, currentStroke, brushColor, brushWidth);
      }

      // Add glow effect to recent strokes
      if (strokes.length > 0) {
        const recentStroke = strokes[strokes.length - 1];
        addGlowEffect(ctx, recentStroke.points, recentStroke.color, time);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [strokes, currentStroke, brushColor, brushWidth]);

  return (
    <div className="relative w-full h-full">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
        {/* Color Picker Button */}
        <motion.button
          onClick={() => setShowPalette(!showPalette)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full border-2 border-white/30"
          style={{ backgroundColor: brushColor }}
        />

        {/* Brush Size */}
        <input
          type="range"
          min="2"
          max="30"
          value={brushWidth}
          onChange={(e) => setBrushWidth(Number(e.target.value))}
          className="w-24 accent-white"
        />

        {/* Undo */}
        <motion.button
          onClick={undoStroke}
          disabled={strokes.length === 0}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-white/60 hover:text-white disabled:opacity-30"
        >
          <Undo className="w-5 h-5" />
        </motion.button>

        {/* Clear */}
        <motion.button
          onClick={clearCanvas}
          disabled={strokes.length === 0}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-white/60 hover:text-white disabled:opacity-30"
        >
          <Eraser className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Color Palette */}
      {showPalette && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-xl"
        >
          {brushColors.map((c) => (
            <motion.button
              key={c}
              onClick={() => handleColorChange(c)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`w-8 h-8 rounded-full ${brushColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </motion.div>
      )}

      {/* Drawing Hint */}
      {strokes.length === 0 && currentStroke.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-white/30 text-center">
            <p className="text-lg mb-2">Draw your emotion</p>
            <p className="text-sm">Express without words</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Smooth stroke drawing with bezier curves
function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: DrawPoint[],
  color: string,
  width: number
) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Move to first point
  ctx.moveTo(points[0].x, points[0].y);

  // Draw smooth curve through points
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    
    // Vary width based on pressure/speed
    const pressure = current.pressure || 0.5;
    ctx.lineWidth = width * (0.5 + pressure * 0.5);

    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }

  // Draw to last point
  if (points.length > 1) {
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
  }

  ctx.stroke();
}

// Add glow effect to strokes
function addGlowEffect(
  ctx: CanvasRenderingContext2D,
  points: DrawPoint[],
  color: string,
  time: number
) {
  if (points.length < 2) return;

  const glowAlpha = 0.3 + Math.sin(time * 3) * 0.1;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = hexToRgba(color, glowAlpha);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
}

// Ambient background animation
function drawAmbientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  time: number
) {
  // Subtle gradient
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, hexToRgba(color, 0.05));
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle floating particles
  for (let i = 0; i < 10; i++) {
    const x = (Math.sin(time + i * 0.7) * 0.5 + 0.5) * width;
    const y = (Math.cos(time * 0.8 + i) * 0.5 + 0.5) * height;
    const size = 2 + Math.sin(time * 2 + i) * 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.1);
    ctx.fill();
  }
}
