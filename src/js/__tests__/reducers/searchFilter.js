import { expect } from 'chai';
import reducer from '../../reducers/searchFilter';
import { SEARCH_NOTIFICATIONS, CLEAR_SEARCH } from '../../actions';

describe('reducers/searchFilter.js', () => {
  const initialState = {
    query: ''
  };

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle SEARCH_NOTIFICATIONS', () => {

    const action = {
      type: SEARCH_NOTIFICATIONS,
      query: 'hello'
    };

    expect(reducer(undefined, action)).to.eql({
      ...initialState,
      query: 'hello'
    });

  });

  it('should handle CLEAR_SEARCH', () => {

    const fakeState = {
      query: 'hello'
    };

    expect(reducer(fakeState, {})).to.eql(fakeState);

    const action = {
      type: CLEAR_SEARCH
    };

    expect(reducer(fakeState, action)).to.eql({
      ...initialState,
      query: ''
    });

  });
});
