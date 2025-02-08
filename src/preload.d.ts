import type { GitifyAPI } from './main/types';

declare global {
  interface Window {
    gitify: GitifyAPI;
  }
}
