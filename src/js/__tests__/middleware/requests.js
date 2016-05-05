import { expect } from 'chai';
// import sinon from 'sinon';
import * as actions from '../../actions';
import { CALL_API } from 'redux-api-middleware';
import requestsMiddleware from '../../middleware/requests';

const createFakeStore = fakeData => ({
  getState() {
    return {
      auth: {
        token: 'IMATOKEN'
      },
      settings: {
        participating: true
      }
    };
  }
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = requestsMiddleware(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt);
  dispatch(action);
  return dispatched;
};

describe('middleware/notifications.js', () => {

  beforeEach(function() {

  });

  it('should append the url with the participating option', () => {

    const action = {};
    action[CALL_API] = {
      headers: {},
      types: [
        actions.NOTIFICATIONS_REQUEST
      ]
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);

  });


  it('should dispatch a non RSAA action and stop there', () => {

    const action = {
      type: 'NOT_CALL_API'
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);

  });

});
