import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  mockAuth,
  mockGitHubCloudAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { ensureStableEmojis } from '../../__mocks__/utils';
import { AppContext } from '../../context/App';
import { GroupBy } from '../../types';
import { mockGitHubNotifications } from '../../utils/api/__mocks__/response-mocks';
import * as links from '../../utils/links';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>Repository Notifications</div>,
}));

describe('renderer/components/notifications/AccountNotifications.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself - group notifications by repositories', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHeader: true,
      error: null,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } }}
      >
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - group notifications by date', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHeader: true,
      error: null,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
      >
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - no notifications', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - account error for single account', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      error: {
        title: 'Error title',
        descriptions: ['Error description'],
        emojis: ['🔥'],
      },
      showAccountHeader: true,
    };

    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(
        <AppContext.Provider
          value={{
            auth: { accounts: [mockGitHubCloudAccount] },
            settings: mockSettings,
          }}
        >
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - account error for multiple accounts', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      error: {
        title: 'Error title',
        descriptions: ['Error description'],
        emojis: ['🔥'],
      },
      showAccountHeader: true,
    };

    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(
        <AppContext.Provider value={{ auth: mockAuth, settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    expect(tree).toMatchSnapshot();
  });

  it('should open profile when clicked', async () => {
    const openAccountProfileMock = jest
      .spyOn(links, 'openAccountProfile')
      .mockImplementation();

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('account-profile'));

    expect(openAccountProfileMock).toHaveBeenCalledTimes(1);
    expect(openAccountProfileMock).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('should open my issues when clicked', async () => {
    const openMyIssuesMock = jest
      .spyOn(links, 'openGitHubIssues')
      .mockImplementation();

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('account-issues'));

    expect(openMyIssuesMock).toHaveBeenCalledTimes(1);
    expect(openMyIssuesMock).toHaveBeenCalledWith(
      mockGitHubCloudAccount.hostname,
    );
  });

  it('should open my pull requests when clicked', async () => {
    const openPullRequestsMock = jest
      .spyOn(links, 'openGitHubPulls')
      .mockImplementation();

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('account-pull-requests'));

    expect(openPullRequestsMock).toHaveBeenCalledTimes(1);
    expect(openPullRequestsMock).toHaveBeenCalledWith(
      mockGitHubCloudAccount.hostname,
    );
  });

  it('should toggle account notifications visibility', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHeader: true,
      error: null,
    };

    render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('account-toggle'));

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
