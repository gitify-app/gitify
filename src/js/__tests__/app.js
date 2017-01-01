import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';

describe('app.js', function () {
  it('should render the things', function () {
    ReactDOM.render = jest.fn();
    require('../app');

    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  });
});
