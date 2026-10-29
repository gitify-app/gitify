import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment, type ReactElement } from 'react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';
import {
  mockGithubEnterpriseGitifyNotifications,
  mockMultipleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import { GroupBy } from '../../types';

import { NotificationList } from './NotificationList';

// LegendList virtualizes based on real scroll metrics, which happy-dom cannot
// provide. Renders every flattened item through the real renderItem callback so
// the component's useMemo flattening still runs and can be asserted on.
vi.mock('@legendapp/list/react', () => ({
  LegendList: ({
    data,
    keyExtractor,
    renderItem,
  }: {
    data: unknown[];
    keyExtractor: (item: unknown) => string;
    renderItem: (info: { item: unknown }) => ReactElement;
  }) => (
    <div>
      {data.map((item) => (
        <Fragment key={keyExtractor(item)}>{renderItem({ item })}</Fragment>
      ))}
    </div>
  ),
}));

describe('renderer/components/notifications/NotificationList.tsx', () => {
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
