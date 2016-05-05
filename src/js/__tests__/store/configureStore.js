import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import configureStore from '../../store/configureStore';


describe('store/configureStore.js', function () {

  it('should load the store', function () {

    const store = configureStore();

    expect(store.dispatch).to.be.defined;
    expect(store.subscribe).to.be.defined;
    expect(store.getState).to.be.defined;
    expect(store.replaceReducer).to.be.defined;

  });

});
