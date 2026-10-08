import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
