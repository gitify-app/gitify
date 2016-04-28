import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import * as storage from 'redux-storage';

import auth from './auth';
import notifications from './notifications';
import searchFilter from './searchFilter';
import settings from './settings';


export default storage.reducer(combineReducers({
  auth,
  notifications,
  searchFilter,
  settings,
  routing: routerReducer
}));
