import { Map, fromJS } from 'immutable';
import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions';
import notificationsMiddleware from '../../middleware/notifications';
import NativeNotifications from '../../utils/notifications';
import Helpers from '../../utils/helpers';

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
      type: actions.NOTIFICATIONS_SUCCESS,
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
      type: actions.MARK_NOTIFICATION_SUCCESS,
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(Helpers.updateTrayIcon).to.have.been.calledOnce;
    expect(Helpers.updateTrayIcon).to.have.been.calledWith(2);

    Helpers.updateTrayIcon.restore();

  });

  it('should mark a repo\'s notification and call the update tray icon helper', () => {

    sinon.spy(Helpers, 'updateTrayIcon');

    const action = {
      type: actions.MARK_REPO_NOTIFICATION_SUCCESS,
      meta: {
        repoSlug: 'manosim/gitify'
      }
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(Helpers.updateTrayIcon).to.have.been.calledOnce;
    expect(Helpers.updateTrayIcon).to.have.been.calledWith(1);

    Helpers.updateTrayIcon.restore();

  });

});
