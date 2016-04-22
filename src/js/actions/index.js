import {CALL_API, getJSON} from 'redux-api-middleware';

// Authentication

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export function loginUser(username, password) {
  return {
    [CALL_API]: {
      endpoint: '/api/accounts/login/',
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password}),
      types: [LOGIN_REQUEST, {
        type: LOGIN_SUCCESS,
        payload: (action, state, res) => getJSON(res)
      }, {
        type: LOGIN_FAILURE,
        payload: (action, state, res) => getJSON(res)
      }]
    }
  };
};

export const LOGOUT = 'LOGOUT';
export function logout() {
  return { type: LOGOUT };
};
