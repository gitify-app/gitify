import { TextDecoder, TextEncoder } from 'node:util';

// Prevent "ReferenceError: TextEncoder is not defined" error
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock OAuth client ID and secret
process.env.OAUTH_CLIENT_ID = 'FAKE_CLIENT_ID_123';
process.env.OAUTH_CLIENT_SECRET = 'FAKE_CLIENT_SECRET_123';
