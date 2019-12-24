import { UPDATE_SETTING, HAS_STARRED } from '../actions';
import { Map } from 'immutable';

const initialState = Map({
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
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
    default:
      return state;
  }
}
