// Load Styles
import '../scss/app.scss';

import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import configureStore from './store/configureStore';
import getRoutes from './routes';

// Store
const store = configureStore();

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(hashHistory, store);

ReactDOM.render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
      <Router history={history}>
        {getRoutes(store)}
      </Router>
  </Provider>,
  document.getElementById('gitify')
);
