import { Map, fromJS } from 'immutable';

import * as actions from '../../actions';
import * as comms from '../../utils/comms';
import notificationsMiddleware from '../../middleware/notifications';
import NativeNotifications from '../../utils/notifications';

const newNotification = [
  {
    id: 987654,
    repo: {
      id: 13,
      full_name: 'manosim/gitify'
    }
  }
];

const notificationsList = fromJS([
  {
    id: 123,
    repository: {
      id: 111111,
      full_name: 'manosim/gitify'
    }
  },
  {
    id: 456,
    repository: {
      id: 111111,
      full_name: 'manosim/gitify'
    }
  },
  {
    id: 789,
    repository: {
      id: 222222,
      full_name: 'facebook/react'
    }
  }
]);

const createFakeStore = fakeData => ({
  getState() {
    return {
      notifications: Map({
        response: notificationsList
      }),
      settings: Map({
        playSound: false,
        showNotifications: false
      })
    };
  }
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = notificationsMiddleware(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt);
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
      payload: newNotification
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);

    expect(NativeNotifications.setup).toHaveBeenCalledTimes(1);
    expect(NativeNotifications.setup).toHaveBeenCalledWith(
      newNotification, Map({ playSound: false, showNotifications: false })
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

  it('should mark a repo\'s notification and call the update tray icon helper', () => {
    const action = {
      type: actions.MARK_REPO_NOTIFICATION.SUCCESS,
      meta: {
        repoSlug: 'manosim/gitify'
      }
    };

    expect(dispatchWithStoreOf({}, action)).toEqual(action);
    expect(comms.updateTrayIcon).toHaveBeenCalledTimes(1);
    expect(comms.updateTrayIcon).toHaveBeenCalledWith(1);
  });
});
