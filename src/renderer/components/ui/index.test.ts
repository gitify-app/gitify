import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Enforces the Primer import boundary in lieu of a `no-restricted-imports` lint
// rule, which the bundled `vp lint` config does not expose. Only value imports
// are restricted; `import type` from `@primer/react` is allowed anywhere.
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
