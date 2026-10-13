import { sanitizeHtml } from './sanitize';

describe('renderer/utils/ui/sanitize.ts', () => {
  it('preserves safe formatting', () => {
    expect(sanitizeHtml('<h3>Title</h3><p>Hello <strong>world</strong></p>')).toBe(
      '<h3>Title</h3><p>Hello <strong>world</strong></p>',
    );
  });

  it('strips unsafe markup', () => {
    const output = sanitizeHtml(
      '<p>Safe</p><script>alert(1)</script><iframe src="https://example.com"></iframe>',
    );

    expect(output).toContain('Safe');
    expect(output).not.toContain('script');
    expect(output).not.toContain('iframe');
  });
});
