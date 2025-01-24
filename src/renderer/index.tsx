import { createRoot } from 'react-dom/client';

import 'nprogress/nprogress.css';
import { App } from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
