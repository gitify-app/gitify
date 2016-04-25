import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import authentication from '../middleware/authentication';
import tokenStore from '../middleware/token-store.js';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const createStoreWithMiddleware = applyMiddleware(
    tokenStore,
    apiMiddleware,
    authentication
  )(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};
