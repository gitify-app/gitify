import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import * as actions from '../actions';

jest.mock('../store/configureStore', () => {
  return () => ({
    getState: () => {
      auth: {
        get: () => null;
      }
    },
    subscribe: () => {},
    dispatch: () => {},
  });
});

describe('app.js', function () {
  it('should render the things', function () {
    spyOn(actions, 'toggleSettingsModal');

    spyOn(ipcRenderer, 'on').and.callFake((eventName, clb) => {
      clb();
    });

    ReactDOM.render = jest.fn();
    require('../app');

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(actions.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });
});
