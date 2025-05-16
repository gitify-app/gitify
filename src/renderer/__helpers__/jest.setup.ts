import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'node:util';

if (!global.TextEncoder || !global.TextDecoder) {
  /**
   * Prevent the following errors with jest:
   * - ReferenceError: TextEncoder is not defined
   * - ReferenceError: TextDecoder is not defined
   */
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';

/**
 * Primer Setup
 */
if (typeof CSS === 'undefined') {
  global.CSS = {} as typeof CSS;
}

if (!CSS.supports) {
  CSS.supports = () => true;
}

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
