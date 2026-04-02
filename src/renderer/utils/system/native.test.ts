import { waitFor } from '@testing-library/react';

import {
  mockMultipleAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import * as url from '../notifications/url';
import * as native from './native';

describe('renderer/utils/system/native.ts', () => {
  const mockHtmlUrl =
    mockSingleAccountNotifications[0].notifications[0].repository.htmlUrl;

  vi.spyOn(url, 'generateGitHubWebUrl').mockImplementation(
    async () => mockHtmlUrl,
  );

  it('should raise a native notification for a single new notification', async () => {
    native.raiseNativeNotification(
      mockSingleAccountNotifications[0].notifications,
    );

    await waitFor(() =>
      expect(window.gitify.raiseNativeNotification).toHaveBeenCalledTimes(1),
    );

    expect(window.gitify.raiseNativeNotification).toHaveBeenCalledWith(
      expect.stringContaining(
        mockSingleAccountNotifications[0].notifications[0].repository.fullName,
      ),
      expect.stringContaining(
        mockSingleAccountNotifications[0].notifications[0].subject.title,
      ),
      expect.stringContaining(mockHtmlUrl),
    );
    expect(url.generateGitHubWebUrl).toHaveBeenCalledTimes(1);
  });

  it('should raise a native notification for multiple new notifications', async () => {
    native.raiseNativeNotification(
      mockMultipleAccountNotifications[0].notifications,
    );

    await waitFor(() =>
      expect(window.gitify.raiseNativeNotification).toHaveBeenCalledTimes(1),
    );

    expect(window.gitify.raiseNativeNotification).toHaveBeenCalledWith(
      'Gitify',
      'You have 2 notifications',
      undefined,
    );
    expect(url.generateGitHubWebUrl).toHaveBeenCalledTimes(0);
  });
});
