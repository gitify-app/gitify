import { createRoot } from 'react-dom/client';

import './theme.css';

import { App } from './App';

// Initialize Tauri bridge (sets up window.gitify) then render app
// In browser mode, the import fails gracefully and app renders without Tauri features
const initApp = async () => {
  try {
    await import('./tauri-bridge');
  } catch {
    // Browser mode - Tauri bridge not available
  }

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
};

initApp();
