export const emotionColors = {
  calm: '#4A90E2',
  joy: '#F5A623',
  sadness: '#7B68EE',
  anger: '#E74C3C',
  fear: '#9B59B6',
  love: '#E91E63',
  peace: '#2ECC71',
  neutral: '#95A5A6',
} as const;

export type EmotionType = keyof typeof emotionColors;

export const emotionPatterns = [
  'waves',
  'circles',
  'spirals',
  'particles',
  'ripples',
  'flow',
  'pulse',
  'draw',
  'rhythm',
] as const;

export type PatternType = typeof emotionPatterns[number];

export const motionIntensities = {
  calm: 0.3,
  moderate: 0.6,
  intense: 1.0,
} as const;

export function getEmotionGradient(color: string): string {
  return `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`;
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
