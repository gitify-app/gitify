import { cn } from './cn';

describe('renderer/utils/cn.ts', () => {
  it('should return a string', () => {
    // oxlint-disable-next-line no-constant-binary-expression -- Intentional truthy/falsy inputs to exercise cn()
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });
});
