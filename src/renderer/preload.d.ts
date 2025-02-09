import type { GitifyAPI } from '../main/preload';

declare global {
  interface Window {
    gitify: GitifyAPI;
  }
}
