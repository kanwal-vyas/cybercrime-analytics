import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './context/ThemeProvider';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
