import { renderWithAppContext } from '../__helpers__/test-utils';
import {
  mockGitHubAppAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockMultipleAccountNotifications } from '../__mocks__/notifications-mocks';

import { useAccountsStore, useSettingsStore } from '../stores';

import { Errors } from '../utils/errors';
import { NotificationsRoute } from './Notifications';

vi.mock('../components/notifications/AccountNotifications', () => ({
  AccountNotifications: () => <p>AccountNotifications</p>,
}));

vi.mock('../components/AllRead', () => ({
  AllRead: () => <p>AllRead</p>,
}));

vi.mock('../components/Oops', () => ({
  Oops: () => <p>Oops</p>,
}));

describe('renderer/routes/Notifications.tsx', () => {
  it('should render itself & its children (with notifications)', () => {
    useAccountsStore.setState({ accounts: [mockGitHubAppAccount] });

    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
      status: 'success',
      globalError: null,
      isOnline: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should force account header when multiple accounts', () => {
    useAccountsStore.setState({
      accounts: [mockGitHubAppAccount, mockGitHubEnterpriseServerAccount],
    });

    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: mockMultipleAccountNotifications,
      hasNotifications: true,
      status: 'success',
      globalError: null,
      isOnline: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [],
      hasNotifications: false,
      status: 'success',
      globalError: null,
      isOnline: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children (show account header)', () => {
    useSettingsStore.setState({ showAccountHeader: true });

    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [mockMultipleAccountNotifications[0]],
      isOnline: true,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render Offline Error when not online', () => {
    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [],
      hasNotifications: false,
      status: 'success',
      globalError: null,
      isOnline: false,
    });

    expect(tree.container).toMatchSnapshot();
  });

  it.each([
    ['bad credentials', Errors.BAD_CREDENTIALS],
    ['missing scopes', Errors.MISSING_SCOPES],
    ['rate limited', Errors.RATE_LIMITED],
    ['unknown error', Errors.UNKNOWN],
    ['default error', null],
  ])('should render Oops for %s', (_label, globalError) => {
    const tree = renderWithAppContext(<NotificationsRoute />, {
      notifications: [],
      hasNotifications: false,
      status: 'error',
      isOnline: true,
      globalError,
    });

    expect(tree.container).toMatchSnapshot();
  });
});
