import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';

const { ipcRenderer } = require('electron');

import { toggleSettingsModal } from './actions';
import configureStore from './store/configureStore';
import getRoutes from './routes';

// Store
const store = configureStore();

ipcRenderer.on('toggle-settings', (event) => {
  store.dispatch(toggleSettingsModal());
});

ReactDOM.render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
      <Router history={hashHistory}>
        {getRoutes(store)}
      </Router>
  </Provider>,
  document.getElementById('gitify')
);
