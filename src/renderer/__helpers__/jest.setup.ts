import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

import axios from 'axios';

/**
 * axios will default to using the XHR adapter which can't be intercepted
 * by nock. So, configure axios to use the node adapter.
 */
axios.defaults.adapter = 'http';


/**
 * Prevent the following errors with jest:
 * - ReferenceError: TextEncoder is not defined
 * - ReferenceError: TextDecoder is not defined
 */
if (!('TextEncoder' in globalThis)) {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
    TextEncoder;
}
if (!('TextDecoder' in globalThis)) {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
    TextDecoder;
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
