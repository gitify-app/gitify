import { Map } from 'immutable';

export function createMiddleware(engine, actionBlacklist = [], actionWhitelist = []) {
  return ({ dispatch, getState }) => {
    return (next) => (action) => {
      return next(action);
    };
  };
};

export function createLoader() {
  const state = {
    auth: Map({
      token: 'LOGGED_IN_TOKEN'
    })
  };

  return () => new Promise(resolve => resolve(state));
}

export function reducer (clb) {
  return (state, action) => clb(state, action);
};
