import api from './api';
import { EmotionType, PatternType } from '@/utils/emotions';

export interface EmotionPost {
  id: string;
  userId: string;
  color: string;
  pattern: PatternType;
  motionIntensity: number;
  createdAt: string;
}

export interface CreateEmotionData {
  color: string;
  pattern: PatternType;
  motionIntensity: number;
}

export const emotionService = {
  // Create emotion post
  createEmotion: async (data: CreateEmotionData): Promise<EmotionPost> => {
    const response = await api.post('/emotions', data);
    return response.data;
  },

  // Get emotion feed
  getFeed: async (page: number = 1, limit: number = 20): Promise<EmotionPost[]> => {
    const response = await api.get('/emotions/feed', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's emotion history
  getHistory: async (): Promise<EmotionPost[]> => {
    const response = await api.get('/emotions/history');
    return response.data;
  },

  // Respond to emotion (visual response)
  respondToEmotion: async (emotionId: string, data: CreateEmotionData): Promise<EmotionPost> => {
    const response = await api.post(`/emotions/${emotionId}/respond`, data);
    return response.data;
  },
  // Get single emotion
  getEmotionById: async (id: string): Promise<EmotionPost> => {
    const response = await api.get(`/emotions/${id}`);
    return response.data;
  },
};
