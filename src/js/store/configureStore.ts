import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import { UPDATE_SETTING, LOGIN } from '../actions';
import { LOGOUT } from '../../types/actions';
import constants from '../utils/constants';
import notificationsMiddlware from '../middleware/notifications';
import rootReducer from '../reducers';
import settingsMiddleware from '../middleware/settings';

const isDev = false;

export default function configureStore() {
  const engine = filter(createEngine(constants.STORAGE_KEY), [
    'settings',
    ['auth', 'token'],
    ['auth', 'enterpriseAccounts'],
  ]);

  const storageMiddleware = storage.createMiddleware(
    engine,
    [],
    [UPDATE_SETTING, LOGIN.SUCCESS, LOGOUT]
  );

  const middlewares = [
    thunkMiddleware,
    notificationsMiddlware,
    settingsMiddleware,
    storageMiddleware,
  ];

  if (isDev) {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({ collapsed: true });
    middlewares.push(logger);
    console.log('adss');
  }

  let store = createStore(
    rootReducer,
    undefined,
    applyMiddleware(...middlewares)
  );

  // Load settings from localStorage
  const load = storage.createLoader(engine);
  load(store);

  return store;
}
