import { UPDATE_SETTING } from '../actions';
import { SettingsState } from '../../types/reducers';
import { Appearance } from '../../types';

const initialState: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false,
  appearance: Appearance.SYSTEM,
};

export default function reducer(state = initialState, action): SettingsState {
  switch (action.type) {
    case UPDATE_SETTING:
      return { ...state, [action.setting]: action.value };
    default:
      return state;
  }
}
