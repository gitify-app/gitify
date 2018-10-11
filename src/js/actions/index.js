import axios from 'axios';
import { parse } from 'url';
import { fromJS, Map } from 'immutable';

import { apiRequest, apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
} from '../utils/helpers';
import Constants from '../utils/constants';

export function makeAsyncActionSet(actionName) {
  return {
    REQUEST: actionName + '_REQUEST',
    SUCCESS: actionName + '_SUCCESS',
    FAILURE: actionName + '_FAILURE',
  };
}

// Authentication

export const LOGIN = makeAsyncActionSet('LOGIN');
export function loginUser(authOptions, code) {
  const { hostname } = authOptions;
  const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;

  return dispatch => {
    const url = `https://${hostname}/login/oauth/access_token`;
    const method = 'POST';
    const data = {
      client_id: authOptions.clientId,
      client_secret: authOptions.clientSecret,
      code: code,
    };

    dispatch({ type: LOGIN.REQUEST });

    return apiRequest(url, method, data)
      .then(function(response) {
        dispatch({
          type: LOGIN.SUCCESS,
          payload: response.data,
          isEnterprise,
          hostname,
        });
      })
      .catch(function(error) {
        dispatch({ type: LOGIN.FAILURE, payload: error.response.data });
      });
  };
}

export const LOGOUT = 'LOGOUT';
export function logout() {
  return { type: LOGOUT };
}

// Notifications

export const NOTIFICATIONS = makeAsyncActionSet('NOTIFICATIONS');
export function fetchNotifications() {
  return (dispatch, getState) => {
    const method = 'GET';
    const { settings } = getState();
    const isGitHubLoggedIn = getState().auth.get('token') !== null;
    const endpointSuffix = `notifications?participating=${settings.get(
      'participating'
    )}`;

    function getGitHubNotifications() {
      if (!isGitHubLoggedIn) {
        return;
      }

      const url = `https://api.${Constants.DEFAULT_AUTH_OPTIONS
        .hostname}/${endpointSuffix}`;
      const token = getState().auth.get('token');
      return apiRequestAuth(url, method, token);
    }

    function getEnterpriseNotifications() {
      const enterpriseAccounts = getState().auth.get('enterpriseAccounts');
      return enterpriseAccounts
        .map(account => {
          const hostname = account.get('hostname');
          const token = account.get('token');
          const url = `https://${hostname}/api/v3/${endpointSuffix}`;
          return apiRequestAuth(url, method, token);
        })
        .toArray();
    }

    dispatch({ type: NOTIFICATIONS.REQUEST });

    return axios
      .all([getGitHubNotifications(), ...getEnterpriseNotifications()])
      .then(
        axios.spread((gitHubNotifications, ...entAccNotifications) => {
          const notifications = fromJS(
            entAccNotifications.map(accNotifications => {
              const { hostname } = parse(accNotifications.config.url);

              return Map({
                hostname,
                notifications: fromJS(accNotifications.data),
              });
            })
          );

          const allNotifications = isGitHubLoggedIn
            ? notifications.push(
                Map({
                  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                  notifications: fromJS(gitHubNotifications.data),
                })
              )
            : notifications;

          dispatch({
            type: NOTIFICATIONS.SUCCESS,
            payload: allNotifications,
          });
        })
      )
      .catch(error =>
        dispatch({ type: NOTIFICATIONS.FAILURE, payload: error.response.data })
      );
  };
}

// Single Notification

export const MARK_NOTIFICATION = makeAsyncActionSet('MARK_NOTIFICATION');
export function markNotification(id, hostname) {
  return (dispatch, getState) => {
    const url = `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`;
    const method = 'PATCH';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.get('enterpriseAccounts');
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.get('token');

    dispatch({ type: MARK_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function(response) {
        dispatch({
          type: MARK_NOTIFICATION.SUCCESS,
          payload: response.data,
          meta: { id, hostname },
        });
      })
      .catch(function(error) {
        dispatch({
          type: MARK_NOTIFICATION.FAILURE,
          payload: error.response.data,
        });
      });
  };
}

// Repo's Notification

export const MARK_REPO_NOTIFICATION = makeAsyncActionSet(
  'MARK_REPO_NOTIFICATION'
);
export function markRepoNotifications(repoSlug, hostname) {
  return (dispatch, getState) => {
    const url = `${generateGitHubAPIUrl(
      hostname
    )}repos/${repoSlug}/notifications`;
    const method = 'PUT';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.get('enterpriseAccounts');
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.get('token');

    dispatch({ type: MARK_REPO_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function(response) {
        dispatch({
          type: MARK_REPO_NOTIFICATION.SUCCESS,
          payload: response.data,
          meta: { hostname, repoSlug },
        });
      })
      .catch(function(error) {
        dispatch({
          type: MARK_REPO_NOTIFICATION.FAILURE,
          payload: error.response.data,
        });
      });
  };
}

// Account's Notification

export const MARK_ACCOUNT_NOTIFICATION = makeAsyncActionSet(
  'MARK_ACCOUNT_NOTIFICATION'
);
export function markAccountNotifications(hostname) {
  return (dispatch, getState) => {
    const url = `${generateGitHubAPIUrl(hostname)}notifications`;
    const method = 'PUT';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.get('enterpriseAccounts');
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.get('token');

    dispatch({ type: MARK_ACCOUNT_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function(response) {
        dispatch({
          type: MARK_ACCOUNT_NOTIFICATION.SUCCESS,
          payload: response.data,
          meta: { hostname },
        });
      })
      .catch(function(error) {
        dispatch({
          type: MARK_ACCOUNT_NOTIFICATION.FAILURE,
          payload: error.response.data,
        });
      });
  };
}

// Starred

export const HAS_STARRED = makeAsyncActionSet('HAS_STARRED');
export function checkHasStarred() {
  return (dispatch, getState) => {
    const url = `https://api.${Constants.DEFAULT_AUTH_OPTIONS
      .hostname}/user/starred/${Constants.REPO_SLUG}`;
    const method = 'GET';
    const token = getState().auth.get('token');

    dispatch({ type: HAS_STARRED.REQUEST });

    return apiRequestAuth(url, method, token)
      .then(function(response) {
        dispatch({ type: HAS_STARRED.SUCCESS, payload: response.data });
      })
      .catch(function(error) {
        dispatch({ type: HAS_STARRED.FAILURE, payload: error.response.data });
      });
  };
}

// Search

export const SEARCH_NOTIFICATIONS = 'SEARCH_NOTIFICATIONS';
export const CLEAR_SEARCH = 'CLEAR_SEARCH';
export function searchNotifications(query) {
  return {
    type: SEARCH_NOTIFICATIONS,
    query: query,
  };
}

export function clearSearch() {
  return {
    type: CLEAR_SEARCH,
  };
}

// Settings

export const UPDATE_SETTING = 'UPDATE_SETTING';
export function updateSetting(setting, value) {
  return {
    type: UPDATE_SETTING,
    setting: setting,
    value: value,
  };
}

export const TOGGLE_SETTINGS_MODAL = 'TOGGLE_SETTINGS_MODAL';
export function toggleSettingsModal() {
  return {
    type: TOGGLE_SETTINGS_MODAL,
  };
}
