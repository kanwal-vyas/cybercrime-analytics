import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BrandedLoader from '../components/ui/BrandedLoader';

// Code-split route components to optimize bundle size and lazy-load on navigation
const OverviewPage = lazy(() => import('../pages/OverviewPage'));
const ExplorePage = lazy(() => import('../pages/ExplorePage'));
const TrendsPage = lazy(() => import('../pages/TrendsPage'));
const ModelsPage = lazy(() => import('../pages/ModelsPage'));
const PatternsPage = lazy(() => import('../pages/PatternsPage'));
const AnomaliesPage = lazy(() => import('../pages/AnomaliesPage'));
const MethodologyPage = lazy(() => import('../pages/MethodologyPage'));
const LiveOperationsPage = lazy(() => import('../pages/LiveOperationsPage'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<BrandedLoader message="Initializing workstation view..." fullscreen={false} />}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/operations" element={<LiveOperationsPage />} />
        <Route path="/live" element={<Navigate to="/operations" replace />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/anomalies" element={<AnomaliesPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        {/* Fallback to Overview */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
