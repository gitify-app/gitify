import { cn } from './cn';

describe('renderer/utils/cn.ts', () => {
  it('should return a string', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });
});
