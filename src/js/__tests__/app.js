import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { stub } from 'sinon';


describe('app.js', function () {

  it('should make a basic test', function () {
    const renderSpy = stub(ReactDOM, 'render');
    require('../app');
    expect(renderSpy).to.have.been.calledThrice;

    expect(2).to.equal(2);

    renderSpy.restore();

  });

});
