import { List, Map } from 'immutable';

import * as actions from '../../actions';
import * as comms from '../../utils/comms';
import {
  mockedGithubNotifications,
  mockedNotificationsRecuderData,
} from '../../__mocks__/mockedData';
import notificationsMiddleware from '../../middleware/notifications';
import NativeNotifications from '../../utils/notifications';

// Keep 3 notifications
// Ps. To receive 4 on actions.NOTIFICATIONS.SUCCESS,
const mockedNotifications = mockedNotificationsRecuderData.deleteIn([
  0,
  'notifications',
  0,
]);

const createFakeStore = () => ({
  getState() {
    return {
      notifications: Map({
        response: mockedNotifications,
      }),
      settings: Map({
        playSound: false,
        showNotifications: false,
      }),
    };
  },
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = notificationsMiddleware(createFakeStore(storeData))(
    actionAttempt => (dispatched = actionAttempt)
  );
  dispatch(action);
  return dispatched;
};

describe('middleware/notifications.js', () => {
  beforeEach(() => {
    spyOn(NativeNotifications, 'setup').and.stub();
    spyOn(comms, 'updateTrayIcon').and.stub();
    spyOn(comms, 'setBadge').and.stub();
  });

  it('should raise notifications (native & sound, update tray icon, set badge)', () => {
    const action = {
      type: actions.NOTIFICATIONS.SUCCESS,
      payload: mockedNotificationsRecuderData,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    const newNotifications = List.of(
      List.of(mockedGithubNotifications.first()),
      List()
    );

    expect(NativeNotifications.setup).toHaveBeenCalledTimes(1);
    expect(NativeNotifications.setup.calls.first().args[0]).toEqual(
      newNotifications
    );
    expect(NativeNotifications.setup.calls.first().args[1]).toEqual(1);
    expect(NativeNotifications.setup.calls.first().args[2]).toEqual(
      Map({ playSound: false, showNotifications: false })
    );
  });

  it('should mark a notification and call the update tray icon helper and set the badge', () => {
    const action = {
      type: actions.MARK_NOTIFICATION.SUCCESS,
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(comms.updateTrayIcon).toHaveBeenCalledTimes(1);
    expect(comms.updateTrayIcon).toHaveBeenCalledWith(2);

    expect(comms.setBadge).toHaveBeenCalledTimes(1);
    expect(comms.setBadge).toHaveBeenCalledWith(2);
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
    expect(comms.setBadge).toHaveBeenCalledTimes(1);
    expect(comms.setBadge).toHaveBeenCalledWith(2);
  });

  it("should mark an account's notification and call the update tray icon helper", () => {
    const action = {
      type: actions.MARK_ACCOUNT_NOTIFICATION.SUCCESS,
      meta: {
        hostname: 'github.com',
      },
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);
    expect(comms.updateTrayIcon).toHaveBeenCalledTimes(1);
    expect(comms.updateTrayIcon).toHaveBeenCalledWith(2);
    expect(comms.setBadge).toHaveBeenCalledTimes(1);
    expect(comms.setBadge).toHaveBeenCalledWith(2);
  });
});
