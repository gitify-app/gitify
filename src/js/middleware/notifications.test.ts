import * as actions from '../actions';
import * as comms from '../utils/comms';
import {
  mockedGithubNotifications,
  mockedNotificationsRecuderData,
} from '../__mocks__/mockedData';
import notificationsMiddleware from './notifications';
import NativeNotifications from '../utils/notifications';

// Keep 3 notifications
// Ps. To receive 4 on actions.NOTIFICATIONS.SUCCESS,
const mockedNotifications = mockedNotificationsRecuderData.map(
  (account, accountIndex) => {
    if (accountIndex === 0) {
      return {
        ...account,
        notifications: account.notifications.filter((_, index) => index !== 0),
      };
    }

    return account;
  }
);

const createFakeStore = () => ({
  getState() {
    return {
      notifications: {
        response: mockedNotifications,
      },
      settings: {
        playSound: false,
        showNotifications: false,
      },
    };
  },
});

const dispatchWithStoreOf = (_, action) => {
  let dispatched = null;
  const dispatch = notificationsMiddleware(createFakeStore())(
    (actionAttempt) => (dispatched = actionAttempt)
  );
  dispatch(action);
  return dispatched;
};

describe('middleware/notifications.js', () => {
  beforeEach(() => {
    spyOn(NativeNotifications, 'setup').and.stub();
    spyOn(comms, 'updateTrayIcon').and.stub();
  });

  it('should raise notifications (native & sound, update tray icon, set badge)', () => {
    const action = {
      type: actions.NOTIFICATIONS.SUCCESS,
      payload: mockedNotificationsRecuderData,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    const newNotifications = [[mockedGithubNotifications[0]], []];

    expect(NativeNotifications.setup).toHaveBeenCalledTimes(1);
    expect(NativeNotifications.setup).toHaveBeenCalledWith(
      newNotifications,
      1,
      { playSound: false, showNotifications: false }
    );
  });

  it('should mark a notification and call the update tray icon helper', () => {
    const action = {
      type: actions.MARK_NOTIFICATION.SUCCESS,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(comms.updateTrayIcon).toHaveBeenCalledTimes(1);
    expect(comms.updateTrayIcon).toHaveBeenCalledWith(2);
  });

  it("should mark a repo's notification and call the update tray icon helper", () => {
    const action = {
      type: actions.MARK_REPO_NOTIFICATION.SUCCESS,
      meta: {
        repoSlug: 'manosim/notifications-test',
        hostname: 'github.com',
      },
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);
    expect(comms.updateTrayIcon).toHaveBeenCalledTimes(1);
    expect(comms.updateTrayIcon).toHaveBeenCalledWith(2);
  });
});
