import React from 'react'; // eslint-disable-line no-unused-vars
import configureStore from './configureStore';

describe('store/configureStore.js', function() {
  it('should load the store', function() {
    const store = configureStore();

    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.replaceReducer).toBeDefined();
  });
});
