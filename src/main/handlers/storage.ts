import { safeStorage } from 'electron';

import { EVENTS } from '../../shared/events';
import { logError, toError } from '../../shared/logger';

import { handleMainEvent } from '../events';

/**
 * Register IPC handlers for OS-level safe storage operations.
 */
export function registerStorageHandlers(): void {
  /**
   * Encrypt a string using Electron's safeStorage and return the encrypted value as a base64 string.
   */
  handleMainEvent(EVENTS.SAFE_STORAGE_ENCRYPT, async (_, value: string) => {
    const encrypted = await safeStorage.encryptStringAsync(value);
    return encrypted.toString('base64');
  });

  /**
   * Decrypt a base64-encoded string using Electron's safeStorage and return the decrypted value.
   */
  handleMainEvent(EVENTS.SAFE_STORAGE_DECRYPT, async (_, value: string) => {
    try {
      const { result } = await safeStorage.decryptStringAsync(
        Buffer.from(value, 'base64'),
      );
      return result;
    } catch (err) {
      logError(
        'main:safe-storage-decrypt',
        'Failed to decrypt value - data may be from old build',
        toError(err),
      );
      throw err;
    }
  });
}
