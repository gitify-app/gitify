import { useEffect } from 'react';

import { BaseStyles } from '@primer/react';
import { ThemeProvider } from '@primer/react/next';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';

import { initializeStoreSubscriptions } from './stores/subscriptions';

import { GlobalEffects } from './components/GlobalEffects';

import { router } from './router';
import './App.css';
import { queryClient } from './utils/api/queryClient';

export function App() {
  // Initialize store subscriptions with proper cleanup
  useEffect(() => {
    const cleanup = initializeStoreSubscriptions();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BaseStyles>
          <GlobalEffects />
          <RouterProvider router={router} />
        </BaseStyles>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
