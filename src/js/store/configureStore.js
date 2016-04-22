import { createStore, applyMiddleware } from 'redux';
import { apiMiddleware } from 'redux-api-middleware';

import authentication from '../middleware/authentication';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const createStoreWithMiddleware = applyMiddleware(
    apiMiddleware,
    authentication
  )(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};
