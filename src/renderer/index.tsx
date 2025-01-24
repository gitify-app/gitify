import { createRoot } from 'react-dom/client';

import 'nprogress/nprogress.css';
import '../../assets/css/main.css';
import { App } from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
