import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ensureStableEmojis,
  renderWithAppContext,
} from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { GroupBy } from '../../types';
import { mockGitHubNotifications } from '../../utils/api/__mocks__/response-mocks';
import * as links from '../../utils/links';
import { AccountNotifications } from './AccountNotifications';

vi.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>RepositoryNotifications</div>,
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

    const tree = renderWithAppContext(<AccountNotifications {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - group notifications by date', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHeader: true,
      error: null,
    };

    const tree = renderWithAppContext(<AccountNotifications {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself - no notifications', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHeader: true,
      error: null,
    };

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />);
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

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />, {
        auth: { accounts: [mockGitHubCloudAccount] },
      });
    });

    // Wait for async emoji loading to complete
    await waitFor(() => {
      expect(tree?.container.querySelector('.emoji')).toBeInTheDocument();
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

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AccountNotifications {...props} />);
    });

    // Wait for async emoji loading to complete
    await waitFor(() => {
      expect(tree?.container.querySelector('.emoji')).toBeInTheDocument();
    });

    expect(tree).toMatchSnapshot();
  });

  it('should open profile when clicked', async () => {
    const openAccountProfileSpy = vi
      .spyOn(links, 'openAccountProfile')
      .mockImplementation(() => {});

    const props = {
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
      .mockImplementation(() => {});

    const props = {
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
      .mockImplementation(() => {});

    const props = {
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
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHeader: true,
      error: null,
    };

    renderWithAppContext(<AccountNotifications {...props} />);

    await userEvent.click(screen.getByTestId('account-toggle'));

    const tree = renderWithAppContext(<AccountNotifications {...props} />);

    expect(tree).toMatchSnapshot();
  });
});
