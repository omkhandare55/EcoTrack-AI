import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Spinner } from './components/common/Spinner';

// Initialize React Query client with robust options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000,
    },
  },
});

// Lazy loaded page components
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  <Spinner size="lg" label="Loading application..." />
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Layout Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="activities" element={<ActivitiesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="recommendations" element={<RecommendationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
