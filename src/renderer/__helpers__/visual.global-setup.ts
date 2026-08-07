/**
 * Refuses to run the visual project anywhere but Linux.
 *
 * Vitest namespaces baselines by platform and silently creates any that are
 * missing. Run bare on macOS, the first run therefore writes a fresh `-darwin`
 * set from whatever the working tree happens to render and the second run
 * passes against it — without ever consulting the committed Linux baselines.
 * A branch carrying a real regression reports green.
 *
 * `scripts/visual.sh` puts the run inside the pinned Linux container, where
 * this check passes. Failing loudly here means the trap cannot be reached even
 * by invoking vitest directly.
 */
export default function setup(): void {
  if (process.platform === 'linux') {
    return;
  }

  throw new Error(
    [
      `Visual regression tests cannot run on ${process.platform}.`,
      '',
      'Baselines are committed for Linux only, because font rendering differs',
      'per platform. Running here would create a separate set of baselines from',
      'the current working tree and then pass against them, hiding any real',
      'regression.',
      '',
      'Run `pnpm test:visual`, which executes the suite inside the pinned',
      'Playwright container (requires Docker on an arm64 host). Otherwise push',
      'the branch and let the Visual Regression CI job report the diff.',
    ].join('\n'),
  );
}
