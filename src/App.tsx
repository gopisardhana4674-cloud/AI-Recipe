import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading pages for optimized performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RecipeGenerator = lazy(() => import('./pages/RecipeGenerator'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails'));
const SavedRecipes = lazy(() => import('./pages/SavedRecipes'));
const Favorites = lazy(() => import('./pages/Favorites'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading indicator skeleton page
function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold text-gray-400">Heating up the ovens...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Dashboard/Chef Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RecipeGenerator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RecipeDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SavedRecipes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Favorites />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MealPlanner />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
