import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/state-mocks';
import type { Link } from '../../types';
import type { UserType } from '../../typesGitHub';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { NotificationFooter } from './NotificationFooter';

describe('renderer/components/notifications/NotificationFooter.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
    };

    const tree = renderWithAppContext(<NotificationFooter {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children when last_read_at is null', async () => {
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.last_read_at = null;

    const props = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<NotificationFooter {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('security alerts should use github icon for avatar', () => {
    it('Repository Dependabot Alerts Thread', async () => {
      jest
        .spyOn(globalThis.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.type = 'RepositoryDependabotAlertsThread';

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<NotificationFooter {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('Repository Vulnerability Alert', async () => {
      jest
        .spyOn(globalThis.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.type = 'RepositoryVulnerabilityAlert';

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<NotificationFooter {...props} />);

      expect(tree).toMatchSnapshot();
    });
  });

  it('should default to known avatar if no user found', async () => {
    jest
      .spyOn(globalThis.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<NotificationFooter {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should open notification user profile', async () => {
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    const props = {
      notification: {
        ...mockSingleNotification,
        subject: {
          ...mockSingleNotification.subject,
          user: {
            login: 'some-user',
            html_url: 'https://github.com/some-user' as Link,
            avatar_url:
              'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
            type: 'User' as UserType,
          },
          reviews: null,
        },
      },
      account: mockGitHubCloudAccount,
    };

    renderWithAppContext(<NotificationFooter {...props} />);

    await userEvent.click(screen.getByTestId('view-profile'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      props.notification.subject.user.html_url,
    );
  });
});
