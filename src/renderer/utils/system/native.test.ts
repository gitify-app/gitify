import {
  mockGitHubCloudGitifyNotifications,
  mockGitifyNotification,
} from '../../__mocks__/notifications-mocks';

import {
  getNativeNotificationGroupId,
  getNativeNotificationId,
} from '../../../shared/nativeNotifications';

import { NativeNotificationStyle } from '../../types';

import { getAccountUUID } from '../auth/utils';
import * as url from '../notifications/url';
import {
  buildNativeNotificationPayload,
  NATIVE_NOTIFICATION_BATCH_CAP,
  raiseNativeNotification,
} from './native';

const options = {
  style: NativeNotificationStyle.INDIVIDUAL,
  actions: true,
  keepVisible: false,
};

describe('renderer/utils/system/native.ts', () => {
  const notification = mockGitifyNotification;
  const accountUUID = getAccountUUID(notification.account);

  beforeEach(() => {
    vi.mocked(window.gitify.nativeNotifications.show).mockClear();
    vi.spyOn(url, 'generateNotificationWebUrl').mockResolvedValue(notification.repository.htmlUrl);
  });

  describe('buildNativeNotificationPayload', () => {
    it('builds an account-scoped identity, group, content, target, and actions', async () => {
      const { payload, url: targetUrl } = await buildNativeNotificationPayload(
        notification,
        options,
      );

      expect(payload.id).toBe(getNativeNotificationId(accountUUID, notification.id));
      expect(payload.groupId).toBe(
        getNativeNotificationGroupId(accountUUID, notification.repository.fullName),
      );
      expect(payload.groupTitle).toBe(notification.repository.fullName);
      expect(payload.title).toBe(notification.repository.fullName);
      expect(payload.subtitle).toContain(notification.reason.title);
      expect(payload.body).toContain(notification.subject.title);
      expect(payload).not.toHaveProperty('url');
      expect(targetUrl).toBe(notification.repository.htmlUrl);
      expect(payload.actions).toEqual([{ id: 'read', label: 'Mark as read' }]);
    });

    it('omits all actions when action buttons are disabled', async () => {
      const { payload } = await buildNativeNotificationPayload(notification, {
        ...options,
        actions: false,
      });

      expect(payload.actions).toEqual([]);
    });

    it('handles a notification without an actor', async () => {
      const { payload } = await buildNativeNotificationPayload(
        {
          ...notification,
          subject: {
            ...notification.subject,
            user: undefined,
            author: undefined,
            commenter: undefined,
          },
        },
        options,
      );

      expect(payload.subtitle).toBe(notification.reason.title);
    });

    it('includes the identifier when the title does not contain it', async () => {
      const { payload } = await buildNativeNotificationPayload(
        {
          ...notification,
          subject: { ...notification.subject, title: 'A title without a number' },
          display: { ...notification.display, identifier: '#123' },
        },
        options,
      );

      expect(payload.body).toContain('#123');
    });
  });

  describe('raiseNativeNotification', () => {
    it('publishes individual notifications below the cap', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);
      const notifications = mockGitHubCloudGitifyNotifications.slice(
        0,
        NATIVE_NOTIFICATION_BATCH_CAP,
      );

      const published = await raiseNativeNotification(notifications, options);

      expect(published).toHaveLength(notifications.length);
      expect(showMock).toHaveBeenCalledTimes(notifications.length);
      expect(showMock.mock.calls.every(([payload]) => payload.id !== 'summary')).toBe(true);
    });

    it('publishes one summary when the style is summary', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);
      const published = await raiseNativeNotification(mockGitHubCloudGitifyNotifications, {
        ...options,
        style: NativeNotificationStyle.SUMMARY,
      });

      expect(published).toHaveLength(1);
      expect(published[0].payload).toMatchObject({
        id: 'summary',
        actions: [{ id: 'show', label: 'Show notifications' }],
        body: `You have ${mockGitHubCloudGitifyNotifications.length} notifications`,
      });
      expect(showMock).toHaveBeenCalledTimes(1);
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

      const published = await raiseNativeNotification(notifications, options);

      expect(published).toHaveLength(1);
      expect(published[0].payload.id).toBe('summary');
      expect(showMock).toHaveBeenCalledTimes(1);
    });

    it('uses the singular summary text for one notification', async () => {
      const published = await raiseNativeNotification([notification], {
        ...options,
        style: NativeNotificationStyle.SUMMARY,
      });

      expect(published[0].payload.body).toBe('You have 1 notification');
    });

    it('does nothing for an empty batch', async () => {
      const showMock = vi.mocked(window.gitify.nativeNotifications.show);

      await expect(raiseNativeNotification([], options)).resolves.toEqual([]);
      expect(showMock).not.toHaveBeenCalled();
    });
  });
});
