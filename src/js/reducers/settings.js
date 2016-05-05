import {
  UPDATE_SETTING
} from '../actions';

const initialState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  markOnClick: false,
  openAtStartup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTING:
      return {
        ...state,
        [action.setting]: action.value
      };
    default:
      return state;
  }
};
