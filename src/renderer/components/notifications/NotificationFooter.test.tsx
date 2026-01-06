import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import type { GitifyNotificationUser, Link } from '../../types';
import * as comms from '../../utils/comms';
import { NotificationFooter } from './NotificationFooter';

describe('renderer/components/notifications/NotificationFooter.tsx', () => {
  jest
    .spyOn(globalThis.Date, 'now')
    .mockImplementation(() => new Date('2024').valueOf());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    const props = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationFooter {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('security alerts should use github icon for avatar', () => {
    it('Repository Dependabot Alerts Thread', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryDependabotAlertsThread';

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<NotificationFooter {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('Repository Vulnerability Alert', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.type = 'RepositoryVulnerabilityAlert';

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<NotificationFooter {...props} />);

      expect(tree).toMatchSnapshot();
    });
  });

  it('should default to known avatar if no user found', async () => {
    const mockNotification = mockGitifyNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<NotificationFooter {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should open notification user profile', async () => {
    const openExternalLinkSpy = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    const props = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          user: {
            login: 'some-user',
            htmlUrl: 'https://github.com/some-user' as Link,
            avatarUrl:
              'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
            type: 'User' as GitifyNotificationUser['type'],
          },
          reviews: null,
        },
      },
      account: mockGitHubCloudAccount,
    };

    renderWithAppContext(<NotificationFooter {...props} />);

    await userEvent.click(screen.getByTestId('view-profile'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      props.notification.subject.user.htmlUrl,
    );
  });
});
