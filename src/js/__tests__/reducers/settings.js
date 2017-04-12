import { Map } from 'immutable';

import reducer from '../../reducers/settings';
import { UPDATE_SETTING, HAS_STARRED, TOGGLE_SETTINGS_MODAL } from '../../actions';

describe('reducers/settings.js', () => {
  const initialState = Map({
    participating: false,
    playSound: true,
    showNotifications: true,
    markOnClick: false,
    openAtStartup: false,
    showSettingsModal: false,
    hasStarred: false,
    showAppIcon: 'both',
    isEnterprise: false,
    baseUrl: 'github.com',
    clientId: '3fef4433a29c6ad8f22c',
    clientSecret: '9670de733096c15322183ff17ed0fc8704050379'
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

  it('should handle TOGGLE_SETTINGS_MODAL', () => {
    const action = {
      type: TOGGLE_SETTINGS_MODAL
    };

    expect(reducer(undefined, action)).toEqual(
      initialState
        .set('showSettingsModal', true)
    );
  });
});
