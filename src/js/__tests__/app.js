import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';

jest.mock('../routes');
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
    ReactDOM.render = jest.fn();
    require('../app');

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  });
});
