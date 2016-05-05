import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { stub } from 'sinon';


describe('app.js', function () {

  it('should render the things', function () {

    const renderSpy = stub(ReactDOM, 'render');
    require('../app');

    expect(renderSpy).to.have.been.calledOnce;

    renderSpy.restore();

  });

});
