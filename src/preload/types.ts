import type { api } from '.';

/**
 * The type of the Gitify Bridge API exposed to the renderer via `contextBridge`.
 *
 * Mirrors the shape of `window.gitify` as declared in `preload.d.ts`.
 */
export type GitifyAPI = typeof api;
