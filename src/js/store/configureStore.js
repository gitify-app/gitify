import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import { checkAuth, fetchNotifications } from '../actions';
import authentication from '../middleware/authentication';
import constants from '../utils/constants';
import notifications from '../middleware/notifications';
import requests from '../middleware/requests';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const engine = filter(createEngine(constants.STORAGE_KEY), ['settings']);
  const storageMiddleware = storage.createMiddleware(engine);

  const createStoreWithMiddleware = applyMiddleware(
    requests, // Should be passed before 'apiMiddleware'
    apiMiddleware,
    authentication,
    notifications,
    storageMiddleware
  )(createStore);

  const store = createStoreWithMiddleware(rootReducer, initialState);

  // Check if the user is logged in
  store.dispatch(checkAuth());
  const isLoggedIn = store.getState().auth.token !== null;

  // Load settings from localStorage
  const load = storage.createLoader(engine);
  load(store)
    .then(function (newState) {
      if (isLoggedIn) { store.dispatch(fetchNotifications()); }
    });

  return store;
};
