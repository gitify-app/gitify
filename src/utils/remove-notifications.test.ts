import {
  mockAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { removeNotifications } from './remove-notifications';

describe('utils/remove-notifications.ts', () => {
  const repoSlug = mockedSingleNotification.repository.full_name;
  const hostname = mockedSingleAccountNotifications[0].account.hostname;

  it("should remove a repo's notifications - single", () => {
    expect(mockSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      repoSlug,
      mockSingleAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it("should remove a repo's notifications - multiple", () => {
    expect(mockAccountNotifications[0].notifications.length).toBe(2);
    expect(mockAccountNotifications[1].notifications.length).toBe(2);

    const result = removeNotifications(
      repoSlug,
      mockAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
    expect(result[1].notifications.length).toBe(2);
  });
});
