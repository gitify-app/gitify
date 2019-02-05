import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { List, Map } from 'immutable';
import { ipcRenderer } from 'electron';
import { MemoryRouter as Router } from 'react-router';

import * as actions from './actions';
import * as configureStore from './store/configureStore';

describe('app.js', function() {
  it('should render the things', function() {
    spyOn(actions, 'toggleSettingsModal');

    spyOn(ipcRenderer, 'on').and.callFake((eventName, clb) => {
      clb();
    });

    configureStore.default = jest.fn(() => ({
      getState: () => ({
        auth: Map({
          token: null,
          enterpriseAccounts: List(),
        }),
      }),
      dispatch: () => {},
      subscribe: () => {},
    }));

    ReactDOM.render = jest.fn();
    require('./App');

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(actions.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should test the PrivateRoute component (authenticated)', function() {
    const configureStoreDefault = configureStore.default;

    configureStore.default = jest.fn(() => ({
      getState: () => ({
        auth: Map({
          token: 123,
          enterpriseAccounts: List(),
        }),
      }),
      dispatch: () => {},
      subscribe: () => {},
    }));

    ReactDOM.render = jest.fn();
    const { PrivateRoute } = require('./App');

    const tree = renderer.create(
      <Router>
        <PrivateRoute />
      </Router>
    );

    expect(tree).toMatchSnapshot();

    configureStore.default = configureStoreDefault;
  });

  it('should test the PrivateRoute component (non authenticated)', function() {
    const configureStoreDefault = configureStore.default;

    configureStore.default = jest.fn(() => ({
      getState: () => ({
        auth: Map({
          token: null,
          enterpriseAccounts: List(),
        }),
      }),
      dispatch: () => {},
      subscribe: () => {},
    }));

    ReactDOM.render = jest.fn();
    const { PrivateRoute } = require('./App');

    const tree = renderer.create(
      <Router>
        <PrivateRoute />
      </Router>
    );

    expect(tree).toMatchSnapshot();

    configureStore.default = configureStoreDefault;
  });

  it('should render the Not Found component', function() {
    const { NotFound } = require('./App');

    const tree = renderer.create(<NotFound />);

    expect(tree).toMatchSnapshot();
  });
});
