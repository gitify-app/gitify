import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '../../actions';
import authenticationMiddleware from '../../middleware/authentication';

const createFakeStore = fakeData => ({
  getState() {
    return fakeData;
  }
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null;
  const dispatch = authenticationMiddleware(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt);
  dispatch(action);
  return dispatched;
};


describe('middleware/authentication.js', () => {

  beforeEach(function() {
    localStorage.removeItem.reset();
  });

  it('should save the token', () => {

    sinon.spy(localStorage, 'setItem');

    const action = {
      type: actions.LOGIN_SUCCESS,
      payload: {
        access_token: 'IMATOKEN'
      }
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(localStorage.setItem).to.have.been.calledOnce;
    expect(localStorage.setItem).to.have.been.calledWith('token', 'IMATOKEN');

    localStorage.setItem.restore();

  });

  it('should remove the token', () => {

    const action = {
      type: actions.LOGOUT
    };

    expect(dispatchWithStoreOf({}, action)).to.eql(action);
    expect(localStorage.removeItem).to.have.been.calledOnce;
    expect(localStorage.removeItem).to.have.been.calledWith('token');

  });
});
