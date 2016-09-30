import * as actions from '../../actions';
import notificationsMiddleware from '../../middleware/notifications';
import NativeNotifications from '../../utils/notifications';
import Helpers from '../../utils/helpers';

const newNotification = [
  {
    id: 987654,
    repo: {
      id: 13
    }
  }
];

const notificationsList = [
  {
    id: 123,
    repository: {
      id: 111111
    }
  },
  {
    id: 456,
    repository: {
      id: 111111
    }
  },
  {
    id: 789,
    repository: {
      id: 222222
    }
  }
];


const createFakeStore = fakeData => ({
  getState() {
    return {
      notifications: {
        response: notificationsList
      },
      settings: {
        playSound: false,
        showNotifications: false
      }
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

  beforeEach(function() {

  });

  it('should raise notifications (native & sound)', () => {

    sinon.spy(NativeNotifications, 'setup');

    const action = {
      type: actions.NOTIFICATIONS.SUCCESS,
      payload: newNotification
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(NativeNotifications.setup).to.have.been.calledOnce;
    expect(NativeNotifications.setup).to.have.been.calledWith(
      newNotification, { playSound: false, showNotifications: false }
    );

    NativeNotifications.setup.restore();

  });

  it('should mark a notification and call the update tray icon helper', () => {

    sinon.spy(Helpers, 'updateTrayIcon');

    const action = {
      type: actions.MARK_NOTIFICATION.SUCCESS,
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(Helpers.updateTrayIcon).to.have.been.calledOnce;
    expect(Helpers.updateTrayIcon).to.have.been.calledWith(2);

    Helpers.updateTrayIcon.restore();

  });

  it('should mark a repo\'s notification and call the update tray icon helper', () => {

    sinon.spy(Helpers, 'updateTrayIcon');

    const action = {
      type: actions.MARK_REPO_NOTIFICATION.SUCCESS,
      meta: {
        repoId: 111111
      }
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(Helpers.updateTrayIcon).to.have.been.calledOnce;
    expect(Helpers.updateTrayIcon).to.have.been.calledWith(1);

    Helpers.updateTrayIcon.restore();

  });

});
