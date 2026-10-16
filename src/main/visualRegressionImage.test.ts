import { readFileSync } from 'node:fs';

/**
 * The visual-regression job runs inside a pinned Playwright container image.
 * Screenshots are only comparable against the exact browser build that image
 * ships, so its version must match the `playwright` devDependency exactly — the
 * same coupling `scripts/visual.sh` applies to local runs.
 *
 * Renovate cannot keep the two in lockstep on its own: the npm package and the
 * MCR image are separate datasources, and MCR exposes no release timestamp for
 * `minimumReleaseAge` to compare, so grouping them still drifts the versions and
 * opens image-only PRs. This check fails fast — in the Run Tests job rather than
 * the slower Visual Regression job — whenever they diverge.
 */
const repoRoot = new URL('../../', import.meta.url);

const PLAYWRIGHT_IMAGE =
  /container:\s+mcr\.microsoft\.com\/playwright:v([^@\s]+)-noble@(sha256:[0-9a-f]{64})/;

describe('CI visual-regression Playwright image', () => {
  const { devDependencies } = JSON.parse(
    readFileSync(new URL('package.json', repoRoot), 'utf8'),
  ) as { devDependencies: Record<string, string> };

  const workflow = readFileSync(new URL('.github/workflows/test.yml', repoRoot), 'utf8');

  it('is pinned to the playwright devDependency version', () => {
    const pinned = workflow.match(PLAYWRIGHT_IMAGE);
    const playwright = devDependencies.playwright;

    expect(
      pinned,
      'Expected a digest-pinned mcr.microsoft.com/playwright container in the visual-regression job of .github/workflows/test.yml.',
    ).not.toBeNull();

    expect(
      pinned?.[1],
      [
        `The visual-regression container must run mcr.microsoft.com/playwright:v${playwright}-noble to match the playwright devDependency.`,
        'Update the tag and refresh the pinned digest with:',
        `  docker buildx imagetools inspect mcr.microsoft.com/playwright:v${playwright}-noble --format '{{.Manifest.Digest}}'`,
      ].join('\n'),
    ).toBe(playwright);
  });
});
