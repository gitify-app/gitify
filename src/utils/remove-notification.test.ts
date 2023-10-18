import {
  mockedSingleAccountNotifications,
  mockedSingleNotification,
} from '../__mocks__/mockedData';
import { removeNotification } from './remove-notification';

describe('utils/remove-notification.ts', () => {
  const notificationId = mockedSingleNotification.id;
  const hostname = mockedSingleAccountNotifications[0].hostname;

  it('should remove a notifiction if it exists', () => {
    expect(mockedSingleAccountNotifications[0].notifications.length).toBe(1);

    const result = removeNotification(
      notificationId,
      mockedSingleAccountNotifications,
      hostname,
    );

    expect(result[0].notifications.length).toBe(0);
  });
});
