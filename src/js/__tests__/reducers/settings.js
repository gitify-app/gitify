import { Map } from 'immutable';

import reducer from '../../reducers/settings';
import { UPDATE_SETTING, HAS_STARRED } from '../../actions';

describe('reducers/settings.js', () => {
  const initialState = Map({
    participating: false,
    playSound: true,
    showNotifications: true,
    markOnClick: false,
    openAtStartup: false,
    showSettingsModal: false,
    hasStarred: false,
    showAppIcon: 'both'
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle UPDATE_SETTING', () => {
    const actionParticipating = {
      type: UPDATE_SETTING,
      setting: 'participating',
      value: true
    };

    expect(reducer(undefined, actionParticipating)).toEqual(
      initialState
        .set('participating', true)
    );

    const actionOpenAtStartUp = {
      type: UPDATE_SETTING,
      setting: 'openAtStartup',
      value: true
    };

    expect(reducer(undefined, actionOpenAtStartUp)).toEqual(
      initialState
        .set('openAtStartup', true)
    );
  });

  it('should handle HAS_STARRED.SUCCESS', () => {
    const actionParticipating = {
      type: HAS_STARRED.SUCCESS
    };

    expect(reducer(undefined, actionParticipating)).toEqual(
      initialState
        .set('hasStarred', true)
    );
  });

  it('should handle HAS_STARRED.SUCCESS', () => {
    const actionParticipating = {
      type: HAS_STARRED.FAILURE
    };

    expect(reducer(undefined, actionParticipating)).toEqual(
      initialState
        .set('hasStarred', false)
    );
  });
});
