import axios from 'axios';
import nock from 'nock';

import { mockSingleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../__mocks__/partial-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { Link } from '../../types';
import type { Repository } from '../../typesGitHub';
import * as logger from '../../utils/logger';
import {
  enrichNotification,
  getUnreadNotificationCount,
} from './notifications';

describe('renderer/utils/notifications/notifications.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getUnreadNotificationCount', () => {
    const result = getUnreadNotificationCount(mockSingleAccountNotifications);

    expect(result).toBe(1);
  });

  it('enrichNotification - catches error and logs message', async () => {
    const rendererLogErrorSpy = jest
      .spyOn(logger, 'rendererLogError')
      .mockImplementation();

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

    expect(rendererLogErrorSpy).toHaveBeenCalledWith(
      'enrichNotification',
      'failed to enrich notification details for',
      mockError,
      mockNotification,
    );
  });
});
