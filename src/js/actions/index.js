import { apiRequest, apiRequestAuth } from '../utils/api-requests';

import Constants from '../utils/constants';

function constructGithubUrl(settings) {
  return `https://${settings.get('isEnterprise') ? '' : 'api.'}
    ${settings.get('baseUrl')}${settings.get('isEnterprise') ? '/api/v3/' : '/'}`;
}

export function makeAsyncActionSet(actionName) {
  return {
    REQUEST: actionName + '_REQUEST',
    SUCCESS: actionName + '_SUCCESS',
    FAILURE: actionName + '_FAILURE'
  };
}

// Authentication

export const LOGIN = makeAsyncActionSet('LOGIN');
export function loginUser(code) {
  return (dispatch, getState) => {
    const { settings } = getState();
    const url = `https://${settings.get('baseUrl')}/login/oauth/access_token`;
    const method = 'POST';
    const data = {
      'client_id': settings.get('clientId'),
      'client_secret': settings.get('clientSecret'),
      'code': code
    };

    dispatch({type: LOGIN.REQUEST});

    return apiRequest(url, method, data)
      .then(function (response) {
        dispatch({type: LOGIN.SUCCESS, payload: response.data});
      })
      .catch(function (error) {
        dispatch({type: LOGIN.FAILURE, payload: error.response.data});
      });

  };
};

export const LOGOUT = 'LOGOUT';
export function logout() {
  return { type: LOGOUT };
};


// Notifications

export const NOTIFICATIONS = makeAsyncActionSet('NOTIFICATIONS');
export function fetchNotifications() {
  return (dispatch, getState) => {

    const participating = getState().settings.participating;
    const { settings } = getState();
    // Construct the api!
    const url = `${constructGithubUrl(settings)}notifications?participating=${participating}`;
    const method = 'GET';
    const token = getState().auth.get('token');

    dispatch({type: NOTIFICATIONS.REQUEST});

    return apiRequestAuth(url, method, token)
      .then(function (response) {
        dispatch({type: NOTIFICATIONS.SUCCESS, payload: response.data});
      })
      .catch(function (error) {
        dispatch({type: NOTIFICATIONS.FAILURE, payload: error.response.data});
      });

  };
};


// Single Notification

export const MARK_NOTIFICATION = makeAsyncActionSet('MARK_NOTIFICATION');
export function markNotification(id) {
  return (dispatch, getState) => {
    const { settings } = getState();
    // Construct the api!
    const url = `${constructGithubUrl(settings)}notifications/threads/${id}`;
    const method = 'PATCH';
    const token = getState().auth.get('token');

    dispatch({type: MARK_NOTIFICATION.REQUEST});

    return apiRequestAuth(url, method, token, {})
      .then(function (response) {
        dispatch({type: MARK_NOTIFICATION.SUCCESS, payload: response.data, meta: { id }});
      })
      .catch(function (error) {
        dispatch({type: MARK_NOTIFICATION.FAILURE, payload: error.response.data});
      });
  };
};


// Repo's Notification

export const MARK_REPO_NOTIFICATION = makeAsyncActionSet('MARK_REPO_NOTIFICATION');
export function markRepoNotifications(repoSlug) {
  return (dispatch, getState) => {

    const { settings } = getState();
    // Construct the api!
    const url = `${constructGithubUrl(settings)}repos/${repoSlug}/notifications`;
    const method = 'PUT';
    const token = getState().auth.get('token');

    dispatch({type: MARK_REPO_NOTIFICATION.REQUEST});

    return apiRequestAuth(url, method, token, {})
      .then(function (response) {
        dispatch({type: MARK_REPO_NOTIFICATION.SUCCESS, payload: response.data, meta: { repoSlug }});
      })
      .catch(function (error) {
        dispatch({type: MARK_REPO_NOTIFICATION.FAILURE, payload: error.response.data});
      });
  };
};


// Starred

export const HAS_STARRED = makeAsyncActionSet('HAS_STARRED');
export function checkHasStarred() {
  return (dispatch, getState) => {
    const { settings } = getState();
    // Construct the api!
    const url = `${constructGithubUrl(settings)}user/starred/${Constants.REPO_SLUG}`;
    const method = 'GET';
    const token = getState().auth.get('token');

    dispatch({type: HAS_STARRED.REQUEST});

    return apiRequestAuth(url, method, token)
      .then(function (response) {
        dispatch({type: HAS_STARRED.SUCCESS, payload: response.data});
      })
      .catch(function (error) {
        dispatch({type: HAS_STARRED.FAILURE, payload: error.response.data});
      });

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


export const TOGGLE_SETTINGS_MODAL = 'TOGGLE_SETTINGS_MODAL';
export function toggleSettingsModal() {
  return {
    type: TOGGLE_SETTINGS_MODAL
  };
};
