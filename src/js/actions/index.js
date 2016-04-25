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

export const CHECK_AUTH = 'CHECK_AUTH';
export function checkAuth() {
  const userToken = localStorage.getItem('token');

  return {
    type: CHECK_AUTH,
    token: userToken
  };
};


// Notifications

export const NOTIFICATIONS_REQUEST = 'NOTIFICATIONS_REQUEST';
export const NOTIFICATIONS_SUCCESS = 'NOTIFICATIONS_SUCCESS';
export const NOTIFICATIONS_FAILURE = 'NOTIFICATIONS_FAILURE';
export function fetchNotifications() {
  return {
    // FIXME! Participating?
    [CALL_API]: {
      endpoint: 'https://api.github.com/notifications',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      types: [NOTIFICATIONS_REQUEST, {
        type: NOTIFICATIONS_SUCCESS,
        payload: (action, state, res) => getJSON(res)
      }, {
        type: NOTIFICATIONS_FAILURE,
        payload: (action, state, res) => getJSON(res)
      }]
    }
  };
};


// Search

export const SEARCH_NOTIFICATIONS = 'SEARCH_NOTIFICATIONS';
export const CLEAR_SEARCH = 'CLEAR_SEARCH';
export function searchNotifications(query) {
  return {
    type: SEARCH_NOTIFICATIONS,
    query: query
  };
};

export function clearSearch() {
  return {
    type: CLEAR_SEARCH
  };
};


// Settings

export const UPDATE_SETTING = 'UPDATE_SETTING';
export function updateSetting(setting, value) {
  return {
    type: UPDATE_SETTING,
    setting: setting,
    value: value
  };
};
