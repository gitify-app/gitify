import nock from 'nock';

import * as logger from '../../../shared/logger';
import { mockSingleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../__mocks__/partial-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { Repository } from '../../typesGitHub';
import { enrichNotification, getNotificationCount } from './notifications';
import { Link } from '../../types';

describe('renderer/utils/notifications/notifications.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotificationCount', () => {
    const result = getNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  it('enrichNotification - catches error and logs message', async () => {
    const logErrorSpy = jest.spyOn(logger, 'logError').mockImplementation();

    const mockError = new Error('Test error');
    const mockNotification = partialMockNotification({
      title: 'This issue will throw an error',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
    });
    const mockRepository = {
      full_name: 'gitify-app/notifications-test',
    } as Repository;
    mockNotification.repository = mockRepository;

    nock('https://api.github.com')
      .get('/repos/gitify-app/notifications-test/issues/1')
      .replyWithError(mockError);

    await enrichNotification(mockNotification, mockSettings);

    expect(logErrorSpy).toHaveBeenCalledWith(
      'enrichNotification',
      'failed to fetch details for notification for',
      mockError,
      mockNotification,
    );
  });
});
