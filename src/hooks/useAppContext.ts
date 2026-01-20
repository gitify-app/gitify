import { useContext } from 'react';

import { AppContext, type AppContextState } from '../context/App';

/**
 * Custom hook that provides type-safe access to AppContext.
 * Throws if used outside of AppProvider.
 */
export function useAppContext(): AppContextState {
  const context = useContext(AppContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context as AppContextState;
}
