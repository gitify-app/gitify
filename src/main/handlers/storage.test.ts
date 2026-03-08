import { EVENTS } from '../../shared/events';

import { registerStorageHandlers } from './storage';

const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    handle: (...args: unknown[]) => handleMock(...args),
  },
  safeStorage: {
    encryptString: vi.fn((str: string) => Buffer.from(str)),
    decryptString: vi.fn((buf: Buffer) => buf.toString()),
  },
}));

const logErrorMock = vi.fn();
vi.mock('../../shared/logger', () => ({
  logError: (...args: unknown[]) => logErrorMock(...args),
}));

describe('main/handlers/storage.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerStorageHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerStorageHandlers()).not.toThrow();
    });

    it('registers expected storage IPC event handlers', () => {
      registerStorageHandlers();

      const registeredHandlers = handleMock.mock.calls.map(
        (call: [string]) => call[0],
      );

      expect(registeredHandlers).toContain(EVENTS.SAFE_STORAGE_ENCRYPT);
      expect(registeredHandlers).toContain(EVENTS.SAFE_STORAGE_DECRYPT);
    });
  });
});
