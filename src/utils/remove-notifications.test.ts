import {
  mockedAccountNotifications,
  mockedSingleAccountNotifications,
  mockedSingleNotification,
} from '../__mocks__/mockedData';
import { removeNotifications } from './remove-notifications';

describe('utils/remove-notifications.ts', () => {
  const repoSlug = mockedSingleNotification.repository.full_name;
  const hostname = mockedSingleAccountNotifications[0].account.hostname;

  it("should remove a repo's notifications - single", () => {
    expect(mockedSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotifications(
      repoSlug,
      mockedSingleAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
  });

  it("should remove a repo's notifications - multiple", () => {
    expect(mockedAccountNotifications[0].notifications.length).toBe(2);
    expect(mockedAccountNotifications[1].notifications.length).toBe(2);

    const result = removeNotifications(
      repoSlug,
      mockedAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
    expect(result[1].notifications.length).toBe(2);
  });
});
