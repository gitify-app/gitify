import { createRoot } from 'react-dom/client';

import 'nprogress/nprogress.css';
import 'tailwindcss/tailwind.css';
import './styles/scrollbar.css';

import { App } from './app';

const container = document.getElementById('gitify');
const root = createRoot(container);
root.render(<App />);
