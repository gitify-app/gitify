import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import { checkHasStarred, fetchNotifications, UPDATE_SETTING, LOGIN_SUCCESS, LOGOUT } from '../actions';
import constants from '../utils/constants';
import notifications from '../middleware/notifications';
import settings from '../middleware/settings';
import requests from '../middleware/requests';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const engine = filter(
    createEngine(constants.STORAGE_KEY),
    ['settings', ['auth', 'token']],
    [['settings', 'hasStarred']]
  );

  const storageMiddleware = storage.createMiddleware(engine, [], [UPDATE_SETTING, LOGIN_SUCCESS, LOGOUT]);

  const middlewares = [
    requests, // Should be passed before 'apiMiddleware'
    apiMiddleware,
    notifications,
    settings,
    storageMiddleware
  ];

  if (process.env.NODE_ENV !== 'production') {
    const createLogger = require('redux-logger');
    const logger = createLogger();
    middlewares.push(logger);
  }

  let store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );

  // Load settings from localStorage
  const load = storage.createLoader(engine);
  load(store)
    .then(function (newState) {
      // Check if the user is logged in
      const isLoggedIn = store.getState().auth.token !== null;
      if (isLoggedIn) {
        store.dispatch(checkHasStarred());
        store.dispatch(fetchNotifications());
      }
    });

  return store;
};
