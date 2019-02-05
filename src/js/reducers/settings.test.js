import reducer from './settings';
import {
  UPDATE_SETTING,
  HAS_STARRED,
  TOGGLE_SETTINGS_MODAL,
} from './../actions';

describe('reducers/settings.js', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });

  it('should handle UPDATE_SETTING', () => {
    const actionParticipating = {
      type: UPDATE_SETTING,
      setting: 'participating',
      value: true,
    };

    expect(reducer(undefined, actionParticipating)).toMatchSnapshot();

    const actionOpenAtStartUp = {
      type: UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true,
    };

    expect(reducer(undefined, actionOpenAtStartUp)).toMatchSnapshot();
  });

  it('should handle HAS_STARRED.SUCCESS', () => {
    const action = {
      type: HAS_STARRED.SUCCESS,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle HAS_STARRED.SUCCESS', () => {
    const action = {
      type: HAS_STARRED.FAILURE,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });

  it('should handle TOGGLE_SETTINGS_MODAL', () => {
    const action = {
      type: TOGGLE_SETTINGS_MODAL,
    };

    expect(reducer(undefined, action)).toMatchSnapshot();
  });
});
