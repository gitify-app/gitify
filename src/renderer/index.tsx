import { createRoot } from 'react-dom/client';

import './i18n';
import { AppErrorBoundary } from './components/AppErrorBoundary';

import { App } from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
