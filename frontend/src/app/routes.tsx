import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/features/home/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { CreateEmotion } from '@/features/emotion/CreateEmotion';
import { EmotionFeed } from '@/features/feed/EmotionFeed';
import { TherapyPage } from '@/features/therapy/TherapyPage';
import { EmotionHistory } from '@/features/history/EmotionHistory';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { SilencePage } from '@/features/silence/SilencePage';
import { ExperimentalPage } from '@/features/experimental/ExperimentalPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CreateEmotion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/silence"
        element={
          <ProtectedRoute>
            <SilencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/experimental"
        element={
          <ProtectedRoute>
            <ExperimentalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <EmotionFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapy"
        element={
          <ProtectedRoute>
            <TherapyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <EmotionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback - redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
