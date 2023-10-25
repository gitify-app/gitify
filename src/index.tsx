import { createRoot } from 'react-dom/client';
import React from 'react';

import 'tailwindcss/tailwind.css';
import 'nprogress/nprogress.css';

import { App } from './app';

const container = document.getElementById('gitify')!;
const root = createRoot(container);
root.render(<App />);
