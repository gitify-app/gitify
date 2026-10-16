import { readFileSync } from 'node:fs';

/**
 * Guards version couplings that CI depends on but that no single manifest
 * expresses. Renovate (or a manual edit) can move one half of a pair and leave
 * the other behind, which otherwise only surfaces as a confusing failure deep in
 * the test or visual-regression run. Asserting the couplings here — against the
 * versions actually installed — turns that into a fast, explicit failure.
 *
 * The vitest couplings are exact peer dependencies: `@vitest/browser-playwright`
 * and `@vitest/coverage-v8` peer on the same `vitest` version that `vite-plus`
 * bundles, and `vite` must resolve to the `@voidzero-dev/vite-plus-core` build
 * that `vite-plus` ships.
 */
const repoRoot = new URL('../../', import.meta.url);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(new URL(path, repoRoot), 'utf8')) as T;
}

type PackageJson = {
  name?: string;
  version: string;
  dependencies?: Record<string, string>;
};

const workflow = readFileSync(new URL('.github/workflows/test.yml', repoRoot), 'utf8');

const playwright = readJson<PackageJson>('node_modules/playwright/package.json');
const vitest = readJson<PackageJson>('node_modules/vitest/package.json');
const browserPlaywright = readJson<PackageJson>(
  'node_modules/@vitest/browser-playwright/package.json',
);
const coverageV8 = readJson<PackageJson>('node_modules/@vitest/coverage-v8/package.json');
const vitePlus = readJson<PackageJson>('node_modules/vite-plus/package.json');
const vite = readJson<PackageJson>('node_modules/vite/package.json');

const PINNED_PLAYWRIGHT_IMAGE =
  /container:\s+mcr\.microsoft\.com\/playwright:v([^@\s]+)-noble@(sha256:[0-9a-f]{64})/;

describe('CI dependency compatibility', () => {
  describe('playwright', () => {
    it('pins the visual-regression image to the installed playwright version', () => {
      const pinned = workflow.match(PINNED_PLAYWRIGHT_IMAGE);

      expect(
        pinned,
        'Expected a digest-pinned mcr.microsoft.com/playwright container in the visual-regression job of .github/workflows/test.yml.',
      ).not.toBeNull();

      expect(
        pinned?.[1],
        [
          `The visual-regression container must run mcr.microsoft.com/playwright:v${playwright.version}-noble to match the installed playwright (driven by the package.json devDependency).`,
          'Update the tag and refresh the pinned digest with:',
          `  docker buildx imagetools inspect mcr.microsoft.com/playwright:v${playwright.version}-noble --format '{{.Manifest.Digest}}'`,
        ].join('\n'),
      ).toBe(playwright.version);
    });
  });

  describe('vitest family', () => {
    it('installs the browser provider and coverage reporter at the vitest version', () => {
      expect(browserPlaywright.version).toBe(vitest.version);
      expect(coverageV8.version).toBe(vitest.version);
    });

    it('installs vitest at the version bundled by vite-plus', () => {
      expect(vitest.version).toBe(vitePlus.dependencies?.vitest);
    });
  });

  describe('vite family', () => {
    it('resolves vite to the vite-plus-core build that vite-plus ships', () => {
      expect(vite.name).toBe('@voidzero-dev/vite-plus-core');
      expect(vitePlus.dependencies?.vite).toBe(`npm:${vite.name}@${vite.version}`);
    });
  });
});
