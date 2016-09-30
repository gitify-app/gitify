import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';


describe('app.js', function () {

  it('should render the things', function () {

    spyOn(ReactDOM, 'render').and.callFake(() => {});
    require('../app');

    expect(ReactDOM.render.calls.count()).toBe(1);
    ReactDOM.render.calls.reset();

  });

});
