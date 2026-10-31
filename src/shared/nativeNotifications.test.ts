import { getNativeNotificationId, NATIVE_NOTIFICATION_SUMMARY_ID } from './nativeNotifications';

// Windows caps a toast's tag at 64 characters.
const WINDOWS_TOAST_ID_LIMIT = 64;

const LONG_ACCOUNT_UUID = btoa(
  'github.enterprise.some-very-long-company-hostname.example.com-123456789-Personal Access Token',
);

describe('shared/nativeNotifications.ts', () => {
  describe('getNativeNotificationId', () => {
    it('is deterministic', () => {
      expect(getNativeNotificationId('account', '123')).toBe(
        getNativeNotificationId('account', '123'),
      );
    });

    it('differs per account and per notification', () => {
      const id = getNativeNotificationId('account', '123');

      expect(getNativeNotificationId('other-account', '123')).not.toBe(id);
      expect(getNativeNotificationId('account', '124')).not.toBe(id);
    });

    it('does not collide when the separator moves', () => {
      expect(getNativeNotificationId('ab', 'c')).not.toBe(getNativeNotificationId('a', 'bc'));
    });

    it('stays within the Windows toast tag limit for long accounts', () => {
      const id = getNativeNotificationId(LONG_ACCOUNT_UUID, '99999999999999999999');

      expect(id.length).toBeLessThanOrEqual(WINDOWS_TOAST_ID_LIMIT);
      expect(id).toMatch(/^n[0-9a-z]+$/);
    });

    it('never equals the summary identity', () => {
      expect(getNativeNotificationId('account', '1')).not.toBe(NATIVE_NOTIFICATION_SUMMARY_ID);
    });
  });
});
