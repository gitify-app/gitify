import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ensureStableEmojis,
  renderWithAppContext,
} from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';

import { GroupBy } from '../../types';

import { useAccountsStore, useSettingsStore } from '../../stores';
import * as links from '../../utils/system/links';
import {
  AccountNotifications,
  type AccountNotificationsProps,
} from './AccountNotifications';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

vi.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>RepositoryNotifications</div>,
}));

describe('renderer/components/notifications/AccountNotifications.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself - group notifications by repositories', () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubCloudGitifyNotifications,
      showAccountHeader: true,
      error: null,
    };

    useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });
    const tree = renderWithAppContext(<AccountNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself - group notifications by date', () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubCloudGitifyNotifications,
      showAccountHeader: true,
      error: null,
    };

    useSettingsStore.setState({ groupBy: GroupBy.DATE });
    const tree = renderWithAppContext(<AccountNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself - no notifications', async () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />);
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself - account error for single account', async () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      error: {
        title: 'Error title',
        descriptions: ['Error description'],
        emojis: ['🔥'],
      },
      showAccountHeader: true,
    };

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />);
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself - account error for multiple accounts', async () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      error: {
        title: 'Error title',
        descriptions: ['Error description'],
        emojis: ['🔥'],
      },
      showAccountHeader: true,
    };

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    useAccountsStore.setState({
      accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
    });
    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />);
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should open profile when clicked', async () => {
    const openAccountProfileSpy = vi
      .spyOn(links, 'openAccountProfile')
      .mockImplementation(vi.fn());

    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    renderWithAppContext(<AccountNotifications {...props} />);

    await userEvent.click(screen.getByTestId('account-profile'));

    expect(openAccountProfileSpy).toHaveBeenCalledTimes(1);
    expect(openAccountProfileSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('should open my issues when clicked', async () => {
    const openGitHubIssuesSpy = vi
      .spyOn(links, 'openGitHubIssues')
      .mockImplementation(vi.fn());

    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    renderWithAppContext(<AccountNotifications {...props} />);

    await userEvent.click(screen.getByTestId('account-issues'));

    expect(openGitHubIssuesSpy).toHaveBeenCalledTimes(1);
    expect(openGitHubIssuesSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount.hostname,
    );
  });

  it('should open my pull requests when clicked', async () => {
    const openGitHubPullsSpy = vi
      .spyOn(links, 'openGitHubPulls')
      .mockImplementation(vi.fn());

    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    renderWithAppContext(<AccountNotifications {...props} />);

    await userEvent.click(screen.getByTestId('account-pull-requests'));

    expect(openGitHubPullsSpy).toHaveBeenCalledTimes(1);
    expect(openGitHubPullsSpy).toHaveBeenCalledWith(
      mockGitHubCloudAccount.hostname,
    );
  });

  it('should toggle account notifications visibility', async () => {
    const props: AccountNotificationsProps = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubCloudGitifyNotifications,
      showAccountHeader: true,
      error: null,
    };

    renderWithAppContext(<AccountNotifications {...props} />);

    await userEvent.click(screen.getByTestId('account-toggle'));

    const tree = renderWithAppContext(<AccountNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
