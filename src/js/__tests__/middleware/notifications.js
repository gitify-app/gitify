import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions';
import notificationsMiddleware from '../../middleware/notifications';
import NativeNotifications from '../../utils/notifications';
import Helpers from '../../utils/helpers';

const notifications = [
  {
    id: 123
  }
];

const createFakeStore = fakeData => ({
  getState() {
    return {
      notifications: {
        response: [
          {
            id: 456
          }
        ]
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
      type: actions.NOTIFICATIONS_SUCCESS,
      payload: notifications
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(NativeNotifications.setup).to.have.been.calledOnce;
    expect(NativeNotifications.setup).to.have.been.calledWith(
      [{ id: 123 }], { playSound: false, showNotifications: false }
    );

    NativeNotifications.setup.restore();

  });

  it('should decide to update the tray icon color', () => {

    sinon.spy(Helpers, 'updateTrayIcon');

    const action = {
      type: actions.MARK_NOTIFICATION_REQUEST,
      payload: [
        {
          id: 123
        }
      ]
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(Helpers.updateTrayIcon).to.have.been.calledOnce;
    expect(Helpers.updateTrayIcon).to.have.been.calledWith([{ id: 123 }]);

    Helpers.updateTrayIcon.restore();

  });

});
