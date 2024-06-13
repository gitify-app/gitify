import { cn } from './cn';

describe('utils/cn.ts', () => {
  it('should return a string', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });

  it('should ignore anything that is not a string', () => {
    expect(cn('foo', null, undefined, 1, '', ['bar'], { baz: 'qux' })).toBe(
      'foo',
    );
  });
});
