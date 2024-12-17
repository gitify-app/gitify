import { TextDecoder, TextEncoder } from 'node:util';

/**
 * Prevent the following errors with jest:
 * - ReferenceError: TextEncoder is not defined
 * - ReferenceError: TextDecoder is not defined
 */
if (!global.TextEncoder || !global.TextDecoder) {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';
