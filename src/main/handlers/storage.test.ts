import type { SafeStorage } from 'electron';
import { safeStorage } from 'electron';

import { EVENTS } from '../../shared/events';

import { registerStorageHandlers } from './storage';

type IpcHandler = (
  event: unknown,
  ...args: unknown[]
) => unknown | Promise<unknown>;

const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    handle: (...args: unknown[]) => handleMock(...args),
  },
  safeStorage: {
    encryptStringAsync: vi.fn(async (str: string) => Buffer.from(str)),
    decryptStringAsync: vi.fn(async (buf: Buffer) => ({
      shouldReEncrypt: false,
      result: buf.toString(),
    })),
  } satisfies Pick<SafeStorage, 'encryptStringAsync' | 'decryptStringAsync'>,
}));

const logErrorMock = vi.fn();
vi.mock('../../shared/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../shared/logger')>();
  return {
    ...actual,
    logError: (...args: unknown[]) => logErrorMock(...args),
  };
});

function getHandler(event: string): IpcHandler {
  const call = handleMock.mock.calls.find(
    (entry: unknown[]) => entry[0] === event,
  );
  if (!call) {
    throw new Error(`No handler registered for ${event}`);
  }
  return call[1] as IpcHandler;
}

describe('main/handlers/storage.ts', () => {
  describe('registerStorageHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerStorageHandlers()).not.toThrow();
    });

    it('registers expected storage IPC event handlers', () => {
      registerStorageHandlers();

      const registeredHandlers = handleMock.mock.calls.map(
        (call: unknown[]) => call[0],
      );

      expect(registeredHandlers).toContain(EVENTS.SAFE_STORAGE_ENCRYPT);
      expect(registeredHandlers).toContain(EVENTS.SAFE_STORAGE_DECRYPT);
    });

    it('encrypt handler returns a base64 string', async () => {
      registerStorageHandlers();
      const encrypt = getHandler(EVENTS.SAFE_STORAGE_ENCRYPT);

      const result = await encrypt({}, 'plain-token');

      expect(typeof result).toBe('string');
      expect(result).toBe(Buffer.from('plain-token').toString('base64'));
    });

    it('decrypt handler returns the unwrapped token without rotation', async () => {
      registerStorageHandlers();
      const decrypt = getHandler(EVENTS.SAFE_STORAGE_DECRYPT);

      const ciphertext = Buffer.from('plain-token').toString('base64');
      const result = await decrypt({}, ciphertext);

      expect(result).toEqual({ token: 'plain-token' });
      expect(safeStorage.encryptStringAsync).not.toHaveBeenCalled();
    });

    it('decrypt handler re-encrypts and returns new ciphertext when shouldReEncrypt is true', async () => {
      vi.mocked(safeStorage.decryptStringAsync).mockResolvedValueOnce({
        shouldReEncrypt: true,
        result: 'rotated-token',
      });
      registerStorageHandlers();
      const decrypt = getHandler(EVENTS.SAFE_STORAGE_DECRYPT);

      const result = await decrypt({}, 'irrelevant');

      expect(safeStorage.encryptStringAsync).toHaveBeenCalledWith(
        'rotated-token',
      );
      expect(result).toEqual({
        token: 'rotated-token',
        reEncryptedToken: Buffer.from('rotated-token').toString('base64'),
      });
    });

    it('encrypt → decrypt round-trip preserves the original string', async () => {
      registerStorageHandlers();
      const encrypt = getHandler(EVENTS.SAFE_STORAGE_ENCRYPT);
      const decrypt = getHandler(EVENTS.SAFE_STORAGE_DECRYPT);

      const ciphertext = (await encrypt({}, 'round-trip-token')) as string;
      const result = (await decrypt({}, ciphertext)) as { token: string };

      expect(result.token).toBe('round-trip-token');
    });

    it('decrypt handler rethrows and logs on safeStorage failure', async () => {
      const failure = new Error('keychain unavailable');
      vi.mocked(safeStorage.decryptStringAsync).mockRejectedValueOnce(failure);
      registerStorageHandlers();
      const decrypt = getHandler(EVENTS.SAFE_STORAGE_DECRYPT);

      await expect(decrypt({}, 'irrelevant')).rejects.toBe(failure);
      expect(logErrorMock).toHaveBeenCalledWith(
        'main:safe-storage-decrypt',
        expect.any(String),
        failure,
      );
    });
  });
});
