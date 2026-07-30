import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Import boundary guard.
 *
 * The renderer must import Primer components through the app-owned `ui/` layer,
 * never from `@primer/react` directly — otherwise the seam that lets a design
 * language swap an implementation erodes and the two themes drift back together.
 *
 * `import type { ... } from '@primer/react'` is allowed anywhere (the app derives
 * prop types from Primer's public surface); only value imports are restricted.
 *
 * This replaces a linter `no-restricted-imports` rule, which the bundled
 * `vp lint` config does not expose for custom configuration.
 */
const RENDERER = path.join(process.cwd(), 'src/renderer');
const UI_DIR = path.join(RENDERER, 'components', 'ui');
const PRIMER_VALUE_IMPORT = /^import \{[^}]*\} from '@primer\/react'/m;

describe('renderer/components/ui import boundary', () => {
  it('has no direct @primer/react value imports outside components/ui/', () => {
    const offenders = readdirSync(RENDERER, { recursive: true, encoding: 'utf8' })
      .filter((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
      .map((entry) => path.join(RENDERER, entry))
      .filter((abs) => !abs.startsWith(UI_DIR))
      .filter((abs) => PRIMER_VALUE_IMPORT.test(readFileSync(abs, 'utf8')))
      .map((abs) => path.relative(process.cwd(), abs));

    expect(offenders).toEqual([]);
  });
});
