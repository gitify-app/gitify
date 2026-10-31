import {
  mockGitHubCloudGitifyNotifications,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';

import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import { getAccountUUID } from '../auth/utils';
import {
  buildNativeNotificationPayload,
  NATIVE_NOTIFICATION_BATCH_CAP,
  raiseNativeNotification,
} from './native';

describe('renderer/utils/system/native.ts', () => {
  const notification = mockGitifyNotification;
  const accountUUID = getAccountUUID(notification.account);

  beforeEach(() => {
    vi.mocked(window.gitify.nativeNotifications.show).mockClear();
  });

  describe('buildNativeNotificationPayload', () => {
    it('builds the identity, content, and Mark as read action', () => {
      const payload = buildNativeNotificationPayload(notification);

      expect(payload.id).toBe(getNativeNotificationId(accountUUID, notification.id));
      expect(payload.title).toBe(notification.repository.fullName);
      expect(payload.subtitle).toContain(notification.reason.title);
      expect(payload.body).toContain(notification.subject.title);
      expect(payload.actionLabel).toBe('Mark as read');
    });

    it('omits the action for a notification that is already read', () => {
      const payload = buildNativeNotificationPayload({ ...notification, unread: false });

      expect(payload.actionLabel).toBeUndefined();
    });

    it('handles a notification without an actor', () => {
      const payload = buildNativeNotificationPayload({
        ...notification,
        subject: {
          ...notification.subject,
          user: undefined,
          author: undefined,
          commenter: undefined,
        },
      });

      expect(payload.subtitle).toBe(notification.reason.title);
    });

    it('includes the identifier when the title does not contain it', () => {
      const payload = buildNativeNotificationPayload({
        ...notification,
        subject: { ...notification.subject, title: 'A title without a number' },
        display: { ...notification.display, identifier: '#123' },
      });

      expect(payload.body).toContain('#123');
    });
  });

  describe('raiseNativeNotification', () => {
    it('publishes individual notifications at or below the cap', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);
      const notifications = mockGitHubCloudGitifyNotifications.slice(
        0,
        NATIVE_NOTIFICATION_BATCH_CAP,
      );

      const published = await raiseNativeNotification(notifications);

      expect(published).toHaveLength(notifications.length);
      expect(showMock).toHaveBeenCalledTimes(notifications.length);
      expect(
        showMock.mock.calls.every(([payload]) => payload.id !== NATIVE_NOTIFICATION_SUMMARY_ID),
      ).toBe(true);
    });

    it('publishes one summary above the cap', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);
      const notifications = Array.from(
        { length: NATIVE_NOTIFICATION_BATCH_CAP + 1 },
        (_, index) => ({
          ...notification,
          id: `notification-${index}`,
          order: index,
        }),
      );

      const published = await raiseNativeNotification(notifications);

      expect(published).toHaveLength(1);
      expect(showMock).toHaveBeenCalledTimes(1);
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: NATIVE_NOTIFICATION_SUMMARY_ID,
          body: `You have ${notifications.length} notifications`,
        }),
      );
    });

    it('does nothing for an empty batch', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);

      await expect(raiseNativeNotification([])).resolves.toEqual([]);
      expect(showMock).not.toHaveBeenCalled();
    });
  });
});
