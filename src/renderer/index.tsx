import { createRoot } from 'react-dom/client';

import './i18n';
import { App } from './App';
import { installRendererDiagnostics } from './diagnostics';

installRendererDiagnostics();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);
