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


// Notifications

export const NOTIFICATIONS_REQUEST = 'NOTIFICATIONS_REQUEST';
export const NOTIFICATIONS_SUCCESS = 'NOTIFICATIONS_SUCCESS';
export const NOTIFICATIONS_FAILURE = 'NOTIFICATIONS_FAILURE';
export function fetchNotifications() {
  return {
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


// Single Notification

export const MARK_NOTIFICATION_REQUEST = 'MARK_NOTIFICATION_REQUEST';
export const MARK_NOTIFICATION_SUCCESS = 'MARK_NOTIFICATION_SUCCESS';
export const MARK_NOTIFICATION_FAILURE = 'MARK_NOTIFICATION_FAILURE';
export function markNotification(id) {
  return {
    [CALL_API]: {
      endpoint: `https://api.github.com/notifications/threads/${id}`,
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      types: [MARK_NOTIFICATION_REQUEST, {
        type: MARK_NOTIFICATION_SUCCESS,
        meta: { id: id }
      }, MARK_NOTIFICATION_FAILURE]
    }
  };
};


// Repo's Notification

export const MARK_REPO_NOTIFICATION_REQUEST = 'MARK_REPO_NOTIFICATION_REQUEST';
export const MARK_REPO_NOTIFICATION_SUCCESS = 'MARK_REPO_NOTIFICATION_SUCCESS';
export const MARK_REPO_NOTIFICATION_FAILURE = 'MARK_REPO_NOTIFICATION_FAILURE';
export function markRepoNotifications(loginId, repoId, repoFullName) {
  return {
    [CALL_API]: {
      endpoint: `https://api.github.com/repos/${loginId}/${repoId}/notifications`,
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
      types: [MARK_REPO_NOTIFICATION_REQUEST, {
        type: MARK_REPO_NOTIFICATION_SUCCESS,
        meta: { repoFullName, repoId }
      }, MARK_REPO_NOTIFICATION_FAILURE]
    }
  };
};


// Starred

export const HAS_STARRED_REQUEST = 'HAS_STARRED_REQUEST';
export const HAS_STARRED_SUCCESS = 'HAS_STARRED_SUCCESS';
export const HAS_STARRED_FAILURE = 'HAS_STARRED_FAILURE';
export function checkHasStarred() {
  return {
    [CALL_API]: {
      endpoint: `https://api.github.com/user/starred/${Constants.REPO_SLUG}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      types: [HAS_STARRED_REQUEST, HAS_STARRED_SUCCESS, HAS_STARRED_FAILURE]
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
