import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import authentication from '../middleware/authentication';
import token from '../middleware/token.js';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const createStoreWithMiddleware = applyMiddleware(
    token, // Should be passed before 'apiMiddleware'
    apiMiddleware,
    authentication
  )(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};
