import { waitFor } from '@testing-library/react';

import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../../__mocks__/account-mocks';
import * as native from './native';

describe('renderer/utils/notifications/native.ts', () => {
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
        mockSingleAccountNotifications[0].notifications[0].repository.full_name,
      ),
      expect.stringContaining(
        mockSingleAccountNotifications[0].notifications[0].subject.title,
      ),
      expect.stringContaining(
        mockSingleAccountNotifications[0].notifications[0].repository.html_url,
      ),
    );
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
  });
});
