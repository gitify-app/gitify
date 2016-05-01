import { expect } from 'chai';
import reducer from '../../reducers/settings';
import { UPDATE_SETTING } from '../../actions';

describe('reducers/settings.js', () => {
  const initialState = {
    participating: false,
    playSound: true,
    showNotifications: true,
    markOnClick: false,
    openAtStartup: false
  };

  it('should return the initial state', () => {

    expect(reducer(undefined, {})).to.eql(initialState);

  });

  it('should handle UPDATE_SETTING', () => {

    const actionParticipating = {
      type: UPDATE_SETTING,
      setting: 'participating',
      value: true
    };

    expect(reducer(undefined, actionParticipating)).to.eql({
      ...initialState,
      participating: true
    });

    const actionOpenAtStartUp = {
      type: UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true
    };

    expect(reducer(undefined, actionOpenAtStartUp)).to.eql({
      ...initialState,
      openAtStartup: true
    });

  });
});
