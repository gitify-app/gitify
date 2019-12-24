import { combineReducers } from 'redux';
import * as storage from 'redux-storage';

import auth from './auth';
import notifications from './notifications';
import settings from './settings';

export default storage.reducer(
  combineReducers({
    auth,
    notifications,
    settings,
  })
);
