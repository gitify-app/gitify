import { TextDecoder, TextEncoder } from 'node:util';

// Prevent "ReferenceError: TextEncoder is not defined" or "ReferenceError: TextDecoder is not defined" errors
if (!global.TextEncoder || !global.TextDecoder) {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
} 

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';
