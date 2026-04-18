import type { Forge } from '../../types';

export function getResolvedForge(forge: Forge | undefined): Forge {
  return forge ?? 'github';
}

export function isForgeGitea(forge: Forge | undefined): boolean {
  return getResolvedForge(forge) === 'gitea';
}
