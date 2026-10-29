import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { GroupBy } from '../../types';

import { getAccountUUID } from '../auth/utils';
import { buildAccountItems, type ListItem } from './listItems';
import {
  findNotificationFocusTarget,
  getNotificationItemIndex,
  getNotificationListDataKey,
  getStickyHeaderIndices,
  resolveNotificationFocus,
} from './listPositioning';

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

function emptyFilters() {
  return {
    includeSearchTokens: [],
    excludeSearchTokens: [],
    accounts: [],
    userTypes: [],
    subjectTypes: [],
    states: [],
    reasons: [],
    reviewRequestTypes: [],
  };
}

describe('renderer/utils/notifications/listPositioning.ts', () => {
  const account = mockGitHubCloudAccount;
  const accountUUID = getAccountUUID(account);

  describe('getStickyHeaderIndices', () => {
    it('uses repository headers when repository grouping is active', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [
            notification('a-1', 'owner/repo-a', 0),
            notification('b-1', 'owner/repo-b', 1),
          ],
          error: null,
        },
        makeContext({ showAccountHeader: true }),
      );

      expect(items.map((item) => item.kind)).toEqual([
        'account',
        'repository',
        'notification',
        'repository',
        'notification',
      ]);
      expect(getStickyHeaderIndices(items)).toEqual([1, 3]);
    });

    it('uses the account header when date grouping is active', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [notification('a-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({ showAccountHeader: true, groupBy: GroupBy.DATE }),
      );

      expect(getStickyHeaderIndices(items)).toEqual([0]);
    });

    it('keeps the account header sticky for error and all-read placeholders', () => {
      const errorItems = buildAccountItems(
        {
          account,
          notifications: [],
          error: { title: 'Account failed', descriptions: ['Try again'], emojis: ['🔥'] },
        },
        makeContext({ showAccountHeader: true }),
      );
      const allReadItems = buildAccountItems(
        { account, notifications: [], error: null },
        makeContext({ showAccountHeader: true }),
      );

      expect(getStickyHeaderIndices(errorItems)).toEqual([0]);
      expect(getStickyHeaderIndices(allReadItems)).toEqual([0]);
    });

    it('uses the repository header when the account header is disabled', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [notification('a-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({ showAccountHeader: false }),
      );

      expect(getStickyHeaderIndices(items)).toEqual([0]);
    });

    it('keeps a collapsed account header and a collapsed repository header sticky', () => {
      const collapsedAccountItems = buildAccountItems(
        {
          account,
          notifications: [notification('a-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({ showAccountHeader: true, collapsedAccounts: new Set([accountUUID]) }),
      );
      const collapsedRepoItems = buildAccountItems(
        {
          account,
          notifications: [notification('a-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({
          showAccountHeader: true,
          collapsedRepositories: new Set([`${accountUUID}-owner/repo-a`]),
        }),
      );

      expect(getStickyHeaderIndices(collapsedAccountItems)).toEqual([0]);
      expect(getStickyHeaderIndices(collapsedRepoItems)).toEqual([1]);
    });

    it('never returns an account header and its repository header together', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [
            notification('a-1', 'owner/repo-a', 0),
            notification('b-1', 'owner/repo-b', 1),
          ],
          error: null,
        },
        makeContext({ showAccountHeader: true }),
      );

      expect(getStickyHeaderIndices(items)).not.toContain(0);
    });
  });

  describe('getNotificationItemIndex', () => {
    it('finds a row by account and notification identity', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [notification('n-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({ showAccountHeader: true, groupBy: GroupBy.DATE }),
      );

      expect(getNotificationItemIndex(items, accountUUID, 'n-1')).toBe(1);
    });

    it('returns -1 for a missing target', () => {
      const items = buildAccountItems(
        {
          account,
          notifications: [notification('n-1', 'owner/repo-a', 0)],
          error: null,
        },
        makeContext({ groupBy: GroupBy.DATE }),
      );

      expect(getNotificationItemIndex(items, accountUUID, 'missing')).toBe(-1);
    });

    it('does not confuse identical notification IDs across accounts', () => {
      const secondAccount = mockGitHubEnterpriseServerAccount;
      const secondAccountUUID = getAccountUUID(secondAccount);
      const items: ListItem[] = [
        ...buildAccountItems(
          {
            account,
            notifications: [notification('42', 'owner/repo-a', 0)],
            error: null,
          },
          makeContext({ groupBy: GroupBy.DATE }),
        ),
        ...buildAccountItems(
          {
            account: secondAccount,
            notifications: [{ ...notification('42', 'owner/repo-b', 1), account: secondAccount }],
            error: null,
          },
          makeContext({ groupBy: GroupBy.DATE }),
        ),
      ];

      expect(getNotificationItemIndex(items, accountUUID, '42')).toBe(0);
      expect(getNotificationItemIndex(items, secondAccountUUID, '42')).toBe(1);
    });
  });

  describe('focus target resolution', () => {
    const secondAccount = mockGitHubEnterpriseServerAccount;
    const secondAccountUUID = getAccountUUID(secondAccount);

    const accountNotifications = [
      {
        account,
        notifications: [notification('42', 'owner/repo-a', 0)],
        error: null,
      },
      {
        account: secondAccount,
        notifications: [{ ...notification('42', 'owner/repo-b', 1), account: secondAccount }],
        error: null,
      },
    ];

    it('finds the matching account when IDs repeat', () => {
      const target = findNotificationFocusTarget(accountNotifications, secondAccountUUID, '42');

      expect(target?.account).toBe(secondAccount);
      expect(target?.repository.fullName).toBe('owner/repo-b');
    });

    it('reports a filtered-out target as absent', () => {
      const resolution = resolveNotificationFocus({
        accountNotifications,
        items: [],
        accountUUID,
        notificationId: 'missing',
        collapsedAccounts: new Set(),
        collapsedRepositories: new Set(),
      });

      expect(resolution.status).toBe('filtered-out');
    });

    it('reports a collapsed account before a collapsed repository', () => {
      const resolution = resolveNotificationFocus({
        accountNotifications,
        items: buildAccountItems(
          accountNotifications[0],
          makeContext({
            showAccountHeader: true,
            collapsedAccounts: new Set([accountUUID]),
          }),
        ),
        accountUUID,
        notificationId: '42',
        collapsedAccounts: new Set([accountUUID]),
        collapsedRepositories: new Set([`${accountUUID}-owner/repo-a`]),
      });

      expect(resolution.status).toBe('collapsed-account');
    });

    it('reports a collapsed repository with its key', () => {
      const resolution = resolveNotificationFocus({
        accountNotifications,
        items: buildAccountItems(
          accountNotifications[0],
          makeContext({
            showAccountHeader: true,
            collapsedRepositories: new Set([`${accountUUID}-owner/repo-a`]),
          }),
        ),
        accountUUID,
        notificationId: '42',
        collapsedAccounts: new Set(),
        collapsedRepositories: new Set([`${accountUUID}-owner/repo-a`]),
      });

      expect(resolution.status).toBe('collapsed-repository');
      expect(resolution).toMatchObject({
        status: 'collapsed-repository',
        repoKey: `${accountUUID}-owner/repo-a`,
      });
    });

    it('returns the row index for a visible target', () => {
      const resolution = resolveNotificationFocus({
        accountNotifications,
        items: buildAccountItems(accountNotifications[0], makeContext({ showAccountHeader: true })),
        accountUUID,
        notificationId: '42',
        collapsedAccounts: new Set(),
        collapsedRepositories: new Set(),
      });

      expect(resolution).toMatchObject({ status: 'found', index: 2 });
    });
  });

  describe('getNotificationListDataKey', () => {
    const secondAccount = mockGitHubEnterpriseServerAccount;

    it('is stable for the same grouping, accounts, and filters', () => {
      const input = {
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: emptyFilters(),
      };

      expect(getNotificationListDataKey(input)).toBe(getNotificationListDataKey(input));
    });

    it('does not include notification content or counts', () => {
      const base = getNotificationListDataKey({
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: emptyFilters(),
      });
      const withNotifications = getNotificationListDataKey({
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: emptyFilters(),
      });

      expect(withNotifications).toBe(base);
    });

    it('changes with grouping, filters, and the account set', () => {
      const base = getNotificationListDataKey({
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: emptyFilters(),
      });

      expect(
        getNotificationListDataKey({
          groupBy: GroupBy.DATE,
          accounts: [account],
          filters: emptyFilters(),
        }),
      ).not.toBe(base);

      expect(
        getNotificationListDataKey({
          groupBy: GroupBy.REPOSITORY,
          accounts: [account],
          filters: { ...emptyFilters(), reasons: ['mention'] },
        }),
      ).not.toBe(base);

      expect(
        getNotificationListDataKey({
          groupBy: GroupBy.REPOSITORY,
          accounts: [account, secondAccount],
          filters: emptyFilters(),
        }),
      ).not.toBe(base);
    });

    it('treats a reordered filter value set as the same dataset', () => {
      const first = getNotificationListDataKey({
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: { ...emptyFilters(), includeSearchTokens: ['b', 'a'] },
      });
      const reordered = getNotificationListDataKey({
        groupBy: GroupBy.REPOSITORY,
        accounts: [account],
        filters: { ...emptyFilters(), includeSearchTokens: ['a', 'b'] },
      });

      expect(reordered).toBe(first);
    });
  });
});
