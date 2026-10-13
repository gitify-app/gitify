import sanitize from 'sanitize-html';

/**
 * Sanitise GitHub-rendered HTML for safe display in a preview card.
 *
 * Only formatting is kept (headings, lists, emphasis, code, links, tables).
 * Scripts, embedded frames, styles, and media - including remote images - are
 * stripped so a preview cannot execute code or fetch from the network. This
 * sanitiser is DOM-free, so it behaves identically in the Electron renderer and
 * in tests.
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'blockquote',
      'pre',
      'code',
      'ul',
      'ol',
      'li',
      'dl',
      'dt',
      'dd',
      'strong',
      'em',
      'b',
      'i',
      'u',
      's',
      'del',
      'ins',
      'mark',
      'sub',
      'sup',
      'kbd',
      'samp',
      'var',
      'a',
      'span',
      'div',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'details',
      'summary',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class'],
      span: ['class'],
      div: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });
}
