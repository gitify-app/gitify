import axios from 'axios';
import { parse } from 'url';

import { apiRequest, apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
} from '../utils/helpers';
import Constants from '../utils/constants';
import { LogoutAction, LOGOUT } from '../../types/actions';
import { SettingsState, AppState } from '../../types/reducers';

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

  return (dispatch) => {
    const url = `https://${hostname}/login/oauth/access_token`;
    const method = 'POST';
    const data = {
      client_id: authOptions.clientId,
      client_secret: authOptions.clientSecret,
      code: code,
    };

    dispatch({ type: LOGIN.REQUEST });

    return apiRequest(url, method, data)
      .then(function (response) {
        dispatch({
          type: LOGIN.SUCCESS,
          payload: response.data,
          isEnterprise,
          hostname,
        });
      })
      .catch(function (error) {
        dispatch({ type: LOGIN.FAILURE, payload: error.response.data });
      });
  };
}

export function logout(): LogoutAction {
  return { type: LOGOUT };
}

// Notifications

export const NOTIFICATIONS = makeAsyncActionSet('NOTIFICATIONS');
export function fetchNotifications() {
  return (dispatch, getState: () => AppState) => {
    const method = 'GET';
    const { settings }: { settings: SettingsState } = getState();
    const isGitHubLoggedIn = getState().auth.token !== null;
    const endpointSuffix = `notifications?participating=${settings.participating}`;

    function getGitHubNotifications() {
      if (!isGitHubLoggedIn) {
        return;
      }

      const url = `https://api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}/${endpointSuffix}`;
      const token = getState().auth.token;
      return apiRequestAuth(url, method, token);
    }

    function getEnterpriseNotifications() {
      const enterpriseAccounts = getState().auth.enterpriseAccounts;
      return enterpriseAccounts.map((account) => {
        const hostname = account.hostname;
        const token = account.token;
        const url = `https://${hostname}/api/v3/${endpointSuffix}`;
        return apiRequestAuth(url, method, token);
      });
    }

    dispatch({ type: NOTIFICATIONS.REQUEST });

    return axios
      .all([getGitHubNotifications(), ...getEnterpriseNotifications()])
      .then(
        axios.spread((gitHubNotifications, ...entAccNotifications) => {
          const notifications = entAccNotifications.map(
            (accountNotifications) => {
              const { hostname } = parse(accountNotifications.config.url);

              return {
                hostname,
                notifications: accountNotifications.data,
              };
            }
          );

          const allNotifications = isGitHubLoggedIn
            ? [
                ...notifications,
                {
                  hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                  notifications: gitHubNotifications.data,
                },
              ]
            : [...notifications];

          dispatch({
            type: NOTIFICATIONS.SUCCESS,
            payload: allNotifications,
          });
        })
      )
      .catch((error) =>
        dispatch({ type: NOTIFICATIONS.FAILURE, payload: error.response.data })
      );
  };
}

// Single Notification

export const MARK_NOTIFICATION = makeAsyncActionSet('MARK_NOTIFICATION');
export function markNotification(id, hostname) {
  return (dispatch, getState: () => AppState) => {
    const url = `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`;
    const method = 'PATCH';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.enterpriseAccounts;
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.token;

    dispatch({ type: MARK_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function (response) {
        dispatch({
          type: MARK_NOTIFICATION.SUCCESS,
          meta: { id, hostname },
        });
      })
      .catch(function (error) {
        dispatch({
          type: MARK_NOTIFICATION.FAILURE,
          payload: error.response.data,
        });
      });
  };
}

export const UNSUBSCRIBE_NOTIFICATION = makeAsyncActionSet(
  'UNSUBSCRIBE_NOTIFICATION'
);
export function unsubscribeNotification(id, hostname) {
  return (dispatch, getState: () => AppState) => {
    const url = `${generateGitHubAPIUrl(
      hostname
    )}notifications/threads/${id}/subscription`;
    const method = 'DELETE';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.enterpriseAccounts;
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.token;

    dispatch({ type: UNSUBSCRIBE_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function (response) {
        dispatch({
          type: UNSUBSCRIBE_NOTIFICATION.SUCCESS,
          meta: { id, hostname },
        });
      })
      .catch(function (error) {
        dispatch({
          type: UNSUBSCRIBE_NOTIFICATION.FAILURE,
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
  return (dispatch, getState: () => AppState) => {
    const url = `${generateGitHubAPIUrl(
      hostname
    )}repos/${repoSlug}/notifications`;
    const method = 'PUT';

    const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
    const entAccounts = getState().auth.enterpriseAccounts;
    const token = isEnterprise
      ? getEnterpriseAccountToken(hostname, entAccounts)
      : getState().auth.token;

    dispatch({ type: MARK_REPO_NOTIFICATION.REQUEST });

    return apiRequestAuth(url, method, token, {})
      .then(function (response) {
        dispatch({
          type: MARK_REPO_NOTIFICATION.SUCCESS,
          payload: response.data,
          meta: { hostname, repoSlug },
        });
      })
      .catch(function (error) {
        dispatch({
          type: MARK_REPO_NOTIFICATION.FAILURE,
          payload: error.response.data,
        });
      });
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
