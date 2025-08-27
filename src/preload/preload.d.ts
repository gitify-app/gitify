import type { GitifyAPI } from './types';

declare global {
  interface Window {
    gitify: GitifyAPI;
  }
}
