import { waitFor } from '@testing-library/react';

import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';
import * as helpers from '../helpers';
import * as native from './native';

describe('renderer/utils/notifications/native.ts', () => {
  const mockHtmlUrl =
    mockSingleAccountNotifications[0].notifications[0].repository.htmlUrl;

  jest
    .spyOn(helpers, 'generateGitHubWebUrl')
    .mockImplementation(async () => mockHtmlUrl);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should raise a native notification for a single new notification', async () => {
    native.raiseNativeNotification(
      mockSingleAccountNotifications[0].notifications,
    );

    // wait for async native handling (generateGitHubWebUrl) to complete
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
    expect(helpers.generateGitHubWebUrl).toHaveBeenCalledTimes(1);
  });

  it('should raise a native notification for multiple new notifications', async () => {
    native.raiseNativeNotification(mockAccountNotifications[0].notifications);

    await waitFor(() =>
      expect(window.gitify.raiseNativeNotification).toHaveBeenCalledTimes(1),
    );

    expect(window.gitify.raiseNativeNotification).toHaveBeenCalledWith(
      'Gitify',
      'You have 2 notifications',
      null,
    );
    expect(helpers.generateGitHubWebUrl).toHaveBeenCalledTimes(0);
  });
});
