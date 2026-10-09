import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './context/ThemeProvider';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes/AppRoutes';
import BrandedLoader from './components/ui/BrandedLoader';
import ErrorState from './components/ui/ErrorState';
import api from './services/api';

const MIN_INITIAL_LOAD_DURATION_MS = 3000;

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  const initializeWorkstation = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);

    // Enforce minimum branded loading experience duration on initial startup
    const minDurationPromise = new Promise((resolve) =>
      setTimeout(resolve, MIN_INITIAL_LOAD_DURATION_MS)
    );

    try {
      // Execute backend API health verification and minimum display timer in parallel
      await Promise.all([
        api.getHealth(),
        minDurationPromise,
      ]);
    } catch (err) {
      console.warn('[App] Workstation initialization notice:', err.message);
      // If health check fails on initial startup, transition to error state with retry
      setInitError(err.message || 'Unable to connect to backend analytical service.');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeWorkstation();
  }, [initializeWorkstation]);

  return (
    <ThemeProvider>
      {isInitializing ? (
        <BrandedLoader message="Preparing analytical workspace" fullscreen />
      ) : initError ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app)',
            padding: 'var(--space-6)',
          }}
        >
          <ErrorState
            title="Analytical Service Unavailable"
            message={`Failed to initialize analytical workstation: ${initError}`}
            onRetry={initializeWorkstation}
          />
        </div>
      ) : (
        <BrowserRouter>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

export default App;
