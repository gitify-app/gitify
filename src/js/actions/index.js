import {CALL_API, getJSON} from 'redux-api-middleware';

import Constants from '../utils/constants';

// Authentication

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export function loginUser(code) {
  return {
    [CALL_API]: {
      endpoint: 'https://github.com/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'client_id': Constants.CLIENT_ID,
        'client_secret': Constants.CLIENT_SECRET,
        'code': code
      }),
      types: [LOGIN_REQUEST, {
        type: LOGIN_SUCCESS,
        payload: (action, state, res) => getJSON(res)
      }, {
        type: LOGIN_FAILURE,
        payload: (action, state, res) => {
          console.log(res);
          return getJSON(res);
        }
      }]
    }
  };
};

export const LOGOUT = 'LOGOUT';
export function logout() {
  return { type: LOGOUT };
};
