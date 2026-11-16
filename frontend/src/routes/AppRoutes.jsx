import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OverviewPage from '../pages/OverviewPage';
import ExplorePage from '../pages/ExplorePage';
import TrendsPage from '../pages/TrendsPage';
import ModelsPage from '../pages/ModelsPage';
import PatternsPage from '../pages/PatternsPage';
import AnomaliesPage from '../pages/AnomaliesPage';
import MethodologyPage from '../pages/MethodologyPage';
import LiveOperationsPage from '../pages/LiveOperationsPage';

export const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
