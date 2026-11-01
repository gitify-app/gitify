import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { act, renderHook } from '@testing-library/react';

import { navigateMock } from '../__helpers__/test-utils';

import { useAppNavigate } from './useAppNavigate';

const RENDERER_ROOT = join(process.cwd(), 'src/renderer');
const WRAPPER = join(RENDERER_ROOT, 'hooks/useAppNavigate.ts');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe('useAppNavigate', () => {
  it('is the only renderer module that imports the raw navigation hook', () => {
    const offenders = sourceFiles(RENDERER_ROOT).filter(
      (path) =>
        path !== WRAPPER &&
        /import\s*\{[^}]*\buseNavigate\b[^}]*\}\s*from\s*['"]react-router['"]/.test(
          readFileSync(path, 'utf8'),
        ),
    );

    expect(offenders.map((path) => relative(process.cwd(), path))).toEqual([]);
  });

  it('delegates navigation with the destination and options', () => {
    const { result } = renderHook(() => useAppNavigate());

    act(() => {
      result.current('/settings', { replace: true });
    });

    expect(navigateMock).toHaveBeenCalledWith('/settings', { replace: true });
  });
});
