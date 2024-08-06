import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockGitHubCloudAccount, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { GroupBy } from '../types';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import * as links from '../utils/links';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>Repository Notifications</div>,
}));

describe('components/AccountNotifications.tsx', () => {
  // The read emoji randomly rotates, but then the snapshots would never match
  // Have to make it consistent so the emojis are always the same
  beforeEach(() => {
    global.Math.random = jest.fn(() => 0.1);
  });

  it('should render itself - group notifications by repositories', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
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
      showAccountHostname: true,
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

  it('should render itself - no notifications', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
      error: null,
    };

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself - account error', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      error: {
        title: 'Error title',
        descriptions: ['Error description'],
        emojis: ['🔥'],
      },
      showAccountHostname: true,
    };

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open profile when clicked', async () => {
    const openAccountProfileMock = jest
      .spyOn(links, 'openAccountProfile')
      .mockImplementation();

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
      error: null,
    };

    await act(async () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Open Profile'));

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
      showAccountHostname: true,
      error: null,
    };

    await act(async () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('My Issues'));

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
      showAccountHostname: true,
      error: null,
    };

    await act(async () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('My Pull Requests'));

    expect(openPullRequestsMock).toHaveBeenCalledTimes(1);
    expect(openPullRequestsMock).toHaveBeenCalledWith(
      mockGitHubCloudAccount.hostname,
    );
  });

  it('should toggle account notifications visibility', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
      error: null,
    };

    await act(async () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Hide account notifications'));

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
