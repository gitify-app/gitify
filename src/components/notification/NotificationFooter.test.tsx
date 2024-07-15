import { fireEvent, render, screen } from '@testing-library/react';
import {
  mockGitHubCloudAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { GroupBy, type Link } from '../../types';
import type { UserType } from '../../typesGitHub';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { NotificationFooter } from './NotificationFooter';

describe('components/notification/NotificationFooter.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const props = {
      notification: mockSingleNotification,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
      >
        <NotificationFooter {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children when last_read_at is null', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.last_read_at = null;

    const props = {
      notification: mockNotification,
    };

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <NotificationFooter {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  describe('security alerts should use github icon for avatar', () => {
    it('Repository Dependabot Alerts Thread', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.type = 'RepositoryDependabotAlertsThread';

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <NotificationFooter {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('Repository Vulnerability Alert', async () => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => new Date('2024').valueOf());

      const mockNotification = mockSingleNotification;
      mockNotification.subject.type = 'RepositoryVulnerabilityAlert';

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <NotificationFooter {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  it('should default to known avatar if no user found', async () => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2024').valueOf());

    const mockNotification = mockSingleNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
    };

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <NotificationFooter {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open notification user profile', () => {
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

    render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings },
        }}
      >
        <NotificationFooter {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('View User Profile'));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      props.notification.subject.user.html_url,
    );
  });
});
