import { getNativeNotificationId, NATIVE_NOTIFICATION_SUMMARY_ID } from './nativeNotifications';

describe('shared/nativeNotifications.ts', () => {
  describe('getNativeNotificationId', () => {
    it('returns a stable identity', () => {
      expect(getNativeNotificationId('account', '123')).toBe(
        getNativeNotificationId('account', '123'),
      );
    });

    it('separates accounts and notification IDs', () => {
      const id = getNativeNotificationId('account', '123');

      expect(getNativeNotificationId('other-account', '123')).not.toBe(id);
      expect(getNativeNotificationId('account', '124')).not.toBe(id);
      expect(getNativeNotificationId('ab', 'c')).not.toBe(getNativeNotificationId('a', 'bc'));
    });

    it('stays within the Windows toast tag limit', () => {
      const id = getNativeNotificationId('a'.repeat(500), '99999999999999999999');

      expect(id.length).toBeLessThanOrEqual(12);
      expect(id).not.toBe(NATIVE_NOTIFICATION_SUMMARY_ID);
    });
  });
});
