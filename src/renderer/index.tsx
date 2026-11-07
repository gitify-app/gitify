import { createRoot } from 'react-dom/client';

import { AppErrorBoundary } from './components/AppErrorBoundary';

import { App } from './App';
import { initializeLanguage } from './i18n';
import { rendererLogError, toError } from './utils/core/logger';

const container = document.getElementById('root');
const root = createRoot(container!);

void initializeLanguage()
  .then(() =>
    root.render(
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>,
    ),
  )
  .catch((error) => {
    rendererLogError('language', 'Unable to initialize application language', toError(error));
  });
