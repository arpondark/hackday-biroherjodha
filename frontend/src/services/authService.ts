import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  // Google OAuth login
  googleLogin: async (credential: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};
