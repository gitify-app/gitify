import { UPDATE_SETTING, HAS_STARRED, TOGGLE_SETTINGS_MODAL } from '../actions';
import { Map } from 'immutable';

const initialState = Map({
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  showSettingsModal: false,
  hasStarred: false,
  showAppIcon: 'both',
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTING:
      return state.set(action.setting, action.value);
    case HAS_STARRED.SUCCESS:
      return state.set('hasStarred', true);
    case HAS_STARRED.FAILURE:
      return state.set('hasStarred', false);
    case TOGGLE_SETTINGS_MODAL:
      return state.set('showSettingsModal', !state.get('showSettingsModal'));
    default:
      return state;
  }
}
