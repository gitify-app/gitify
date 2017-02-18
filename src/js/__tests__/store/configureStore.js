import React from 'react'; // eslint-disable-line no-unused-vars
import configureStore from '../../store/configureStore';


describe('store/configureStore.js', function () {

  it('should load the store', function () {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const store = configureStore();

    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.replaceReducer).toBeDefined();

    process.env.NODE_ENV = previousEnv;
  });

});
