import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockAuth } from '../../__mocks__/state-mocks';

import { AccountFilter } from './AccountFilter';

describe('renderer/components/filters/AccountFilter.tsx', () => {
  it('should count notifications from the current filtered list per account', () => {
    const tree = renderWithProviders(<AccountFilter />, {
      accounts: mockAuth.accounts,
      notifications: mockMultipleAccountNotifications,
    });

    const counters = Array.from(
      tree.container.querySelectorAll('span.text-gitify-counter-text'),
    ).map((el) => Number.parseInt(el.textContent ?? '0', 10));

    expect(counters.reduce((sum, value) => sum + value, 0)).toBe(
      mockMultipleAccountNotifications.reduce(
        (sum, account) => sum + account.notifications.length,
        0,
      ),
    );
  });
});
