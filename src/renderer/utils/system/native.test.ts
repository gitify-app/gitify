import {
  mockGitHubCloudGitifyNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import {
  getNativeNotificationId,
  NATIVE_NOTIFICATION_SUMMARY_ID,
} from '../../../shared/nativeNotifications';

import { getAccountUUID } from '../auth/utils';
import { buildNativeNotificationPayload, raiseNativeNotification } from './native';

describe('renderer/utils/system/native.ts', () => {
  const notification = mockGitHubCloudGitifyNotifications[0];
  const accountUUID = getAccountUUID(notification.account);

  beforeEach(() => {
    vi.mocked(window.gitify.nativeNotifications.show).mockClear();
  });

  describe('buildNativeNotificationPayload', () => {
    it('builds the identity, context, formatted body, and action', () => {
      const payload = buildNativeNotificationPayload(notification);

      expect(payload.id).toBe(getNativeNotificationId(accountUUID, notification.id));
      expect(payload.title).toBe(notification.repository.fullName);
      expect(payload.subtitle).toBe(`Updated · @${notification.subject.user?.login}`);
      expect(payload.body).toBe(notification.display.title);
      expect(payload.actionLabel).toBe('Mark as read');
    });

    it('omits the action for a notification that is already read', () => {
      const payload = buildNativeNotificationPayload({ ...notification, unread: false });

      expect(payload.actionLabel).toBeUndefined();
    });

    it('handles a notification without an actor', () => {
      const payload = buildNativeNotificationPayload({
        ...notification,
        subject: { ...notification.subject, user: undefined, author: undefined },
      });

      expect(payload.subtitle).toBe(notification.reason.title);
    });

    it('appends an identifier not already in the display title', () => {
      const payload = buildNativeNotificationPayload({
        ...notification,
        display: { ...notification.display, title: 'A title without a number', identifier: '#123' },
      });

      expect(payload.body).toContain('#123');
    });
  });

  describe('raiseNativeNotification', () => {
    it('publishes one individual notification for one item', () => {
      const published = raiseNativeNotification([notification]);

      expect(published).toHaveLength(1);
      expect(window.gitify.nativeNotifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          id: getNativeNotificationId(accountUUID, notification.id),
          actionLabel: 'Mark as read',
        }),
      );
    });

    it('publishes one count-only summary for multiple items', () => {
      const notifications = mockSingleAccountNotifications[0].notifications.slice(0, 1);
      const second = { ...notification, id: 'second', order: 1 };

      const published = raiseNativeNotification([...notifications, second]);

      expect(published).toHaveLength(1);
      expect(window.gitify.nativeNotifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          id: NATIVE_NOTIFICATION_SUMMARY_ID,
          title: 'Gitify',
          body: 'You have 2 notifications',
        }),
      );
      expect(published[0]).not.toHaveProperty('actionLabel');
    });

    it('does nothing for an empty batch', () => {
      expect(raiseNativeNotification([])).toEqual([]);
      expect(window.gitify.nativeNotifications.show).not.toHaveBeenCalled();
    });
  });
});
