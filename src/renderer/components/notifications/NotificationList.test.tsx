import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  mockGitifyNotification,
  mockGithubEnterpriseGitifyNotifications,
  mockMultipleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import { GroupBy } from '../../types';

import { getAccountUUID } from '../../utils/auth/utils';
import { buildAccountItems, buildRepositoryItems, NotificationList } from './NotificationList';

// LegendList virtualizes based on real scroll metrics, which happy-dom cannot
// provide. Renders every flattened item through the real renderItem callback so
// the component's useMemo flattening still runs and can be asserted on.
vi.mock('@legendapp/list/react', () => ({
  LegendList: ({
    data,
    renderItem,
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown }) => ReactElement;
  }) => <div>{data.map((item) => renderItem({ item }))}</div>,
}));

type BuildItemsContext = Parameters<typeof buildAccountItems>[1];

function makeContext(overrides: Partial<BuildItemsContext> = {}): BuildItemsContext {
  return {
    showAccountHeader: false,
    hasMultipleAccounts: false,
    collapsedAccounts: new Set<string>(),
    collapsedRepositories: new Set<string>(),
    animatingNotifications: new Set<string>(),
    animatingRepositories: new Map<string, ReadonlySet<string>>(),
    groupBy: GroupBy.REPOSITORY,
    ...overrides,
  };
}

function notification(id: string, repoFullName: string, order: number) {
  return {
    ...mockGitifyNotification,
    id,
    order,
    repository: {
      ...(mockGitifyNotification.repository as NonNullable<
        typeof mockGitifyNotification.repository
      >),
      fullName: repoFullName,
    },
  };
}

describe('renderer/components/notifications/NotificationList.tsx', () => {
  describe('buildRepositoryItems', () => {
    const accountUUID = getAccountUUID(mockGitHubCloudAccount);

    it('flattens repositories in first-seen order with their expanded notifications', () => {
      const repoA1 = notification('a-1', 'owner/repo-a', 0);
      const repoB1 = notification('b-1', 'owner/repo-b', 1);
      const repoA2 = notification('a-2', 'owner/repo-a', 2);

      const items = buildRepositoryItems(accountUUID, [repoA1, repoB1, repoA2], makeContext());

      expect(items.map((item) => item.kind)).toEqual([
        'repository',
        'notification',
        'notification',
        'repository',
        'notification',
      ]);
      expect(items.map((item) => item.key)).toEqual([
        `repository-${accountUUID}-owner/repo-a`,
        `notification-${accountUUID}:a-1`,
        `notification-${accountUUID}:a-2`,
        `repository-${accountUUID}-owner/repo-b`,
        `notification-${accountUUID}:b-1`,
      ]);

      const [repoA, , , repoB] = items;
      expect(repoA).toMatchObject({
        kind: 'repository',
        repoKey: `${accountUUID}-owner/repo-a`,
        repoName: 'owner/repo-a',
        notifications: [repoA1, repoA2],
      });
      expect(repoB).toMatchObject({ kind: 'repository', repoName: 'owner/repo-b' });
    });

    it('emits only the repository header when the repository is collapsed', () => {
      const repoA1 = notification('a-1', 'owner/repo-a', 0);
      const repoA2 = notification('a-2', 'owner/repo-a', 1);

      const items = buildRepositoryItems(
        accountUUID,
        [repoA1, repoA2],
        makeContext({ collapsedRepositories: new Set([`${accountUUID}-owner/repo-a`]) }),
      );

      expect(items.map((item) => item.kind)).toEqual(['repository']);
      expect(items[0]).toMatchObject({ key: `repository-${accountUUID}-owner/repo-a` });
    });

    it('marks notifications as animating exit from either animation source', () => {
      const repoA1 = notification('a-1', 'owner/repo-a', 0);
      const repoA2 = notification('a-2', 'owner/repo-a', 1);
      const repoB1 = notification('b-1', 'owner/repo-b', 2);

      const items = buildRepositoryItems(
        accountUUID,
        [repoA1, repoA2, repoB1],
        makeContext({
          animatingNotifications: new Set([`${accountUUID}:a-1`]),
          animatingRepositories: new Map([
            [`${accountUUID}-owner/repo-b`, new Set([`${accountUUID}:b-1`])],
          ]),
        }),
      );

      const animating = items.filter(
        (item) => item.kind === 'notification' && item.isAnimatingExit,
      );
      expect(animating.map((item) => item.key)).toEqual([
        `notification-${accountUUID}:a-1`,
        `notification-${accountUUID}:b-1`,
      ]);
    });

    it('returns an empty list when there are no notifications', () => {
      expect(buildRepositoryItems(accountUUID, [], makeContext())).toEqual([]);
    });
  });

  describe('buildAccountItems', () => {
    const account = mockGitHubCloudAccount;
    const accountUUID = getAccountUUID(account);

    it('emits the account header before sorted notification rows', () => {
      const outOfOrder = [
        notification('zz', 'owner/repo-a', 2),
        notification('aa', 'owner/repo-a', 0),
        notification('mm', 'owner/repo-a', 1),
      ];

      const items = buildAccountItems(
        { account, notifications: outOfOrder, error: null },
        makeContext({ showAccountHeader: true, groupBy: GroupBy.DATE }),
      );

      expect(items.map((item) => item.key)).toEqual([
        `account-${accountUUID}`,
        `notification-${accountUUID}:aa`,
        `notification-${accountUUID}:mm`,
        `notification-${accountUUID}:zz`,
      ]);
      expect(items[0]).toMatchObject({ kind: 'account', account, count: 3 });
    });

    it('marks notification rows as animating exit', () => {
      const items = buildAccountItems(
        { account, notifications: [notification('n-1', 'owner/repo-a', 0)], error: null },
        makeContext({
          groupBy: GroupBy.DATE,
          animatingNotifications: new Set([`${accountUUID}:n-1`]),
        }),
      );

      expect(items).toEqual([
        {
          key: `notification-${accountUUID}:n-1`,
          kind: 'notification',
          notification: notification('n-1', 'owner/repo-a', 0),
          isAnimatingExit: true,
        },
      ]);
    });

    it('returns only the account header when the account is collapsed', () => {
      const items = buildAccountItems(
        { account, notifications: [notification('n-1', 'owner/repo-a', 0)], error: null },
        makeContext({
          showAccountHeader: true,
          collapsedAccounts: new Set([accountUUID]),
          groupBy: GroupBy.DATE,
        }),
      );

      expect(items.map((item) => item.kind)).toEqual(['account']);
    });

    it('emits an error row, full height when it is the only account', () => {
      const error = { title: 'Account failed', descriptions: ['Try again'], emojis: ['🔥'] };
      const entry: Parameters<typeof buildAccountItems>[0] = {
        account,
        notifications: [notification('n-1', 'owner/repo-a', 0)],
        error,
      };

      const singleAccount = buildAccountItems(entry, makeContext({ groupBy: GroupBy.DATE }));
      const multipleAccounts = buildAccountItems(
        entry,
        makeContext({ hasMultipleAccounts: true, groupBy: GroupBy.DATE }),
      );

      expect(singleAccount.map((item) => item.kind)).toEqual(['error', 'notification']);
      expect(singleAccount[0]).toMatchObject({ kind: 'error', error, fullHeight: true });
      expect(multipleAccounts[0]).toMatchObject({ kind: 'error', error, fullHeight: false });
    });

    it('emits an all-read row for a healthy account with no notifications', () => {
      const items = buildAccountItems(
        { account, notifications: [], error: null },
        makeContext({ groupBy: GroupBy.DATE }),
      );

      expect(items).toEqual([{ key: `all-read-${accountUUID}`, kind: 'all-read' }]);
    });

    it('delegates to repository grouping when groupBy is REPOSITORY', () => {
      const repoNotifications = [
        notification('a-1', 'owner/repo-a', 0),
        notification('b-1', 'owner/repo-b', 1),
      ];

      const items = buildAccountItems(
        { account, notifications: repoNotifications, error: null },
        makeContext(),
      );

      expect(items.map((item) => item.key)).toEqual([
        `repository-${accountUUID}-owner/repo-a`,
        `notification-${accountUUID}:a-1`,
        `repository-${accountUUID}-owner/repo-b`,
        `notification-${accountUUID}:b-1`,
      ]);
    });
  });

  describe('NotificationList', () => {
    it('renders account headers, repository headers and notification rows flattened in order', () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      expect(screen.getAllByTestId('account-profile')).toHaveLength(2);
      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(2);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(4);
    });

    it('collapses an account when its header is toggled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getAllByTestId('account-toggle')[0]);

      expect(screen.getAllByTestId('account-profile')).toHaveLength(2);
      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(1);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });

    it('collapses a repository when its header is toggled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotificationList
          accountNotifications={mockMultipleAccountNotifications}
          showAccountHeader
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.REPOSITORY },
        },
      );

      await user.click(screen.getAllByTestId('repository-toggle')[0]);

      expect(screen.getAllByTestId('repository-toggle')).toHaveLength(2);
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });

    it('renders an error row for a failed account and an all-read row for an empty account', () => {
      renderWithProviders(
        <NotificationList
          accountNotifications={[
            {
              account: mockGitHubCloudAccount,
              notifications: [],
              error: { title: 'Account failed', descriptions: ['Try again'], emojis: ['🔥'] },
            },
            {
              account: mockGitHubEnterpriseServerAccount,
              notifications: mockGithubEnterpriseGitifyNotifications,
              error: null,
            },
            {
              account: mockGitHubCloudAccount,
              notifications: [],
              error: null,
            },
          ]}
          showAccountHeader={false}
        />,
        {
          accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
          settings: { groupBy: GroupBy.DATE },
        },
      );

      expect(screen.getByText('Account failed')).toBeInTheDocument();
      expect(screen.getByText(/No new notifications/)).toBeInTheDocument();
      expect(screen.getAllByTestId('notification-row')).toHaveLength(2);
    });
  });
});
