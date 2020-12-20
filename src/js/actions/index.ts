// import axios from 'axios';
// import { parse } from 'url';

// import { apiRequest, apiRequestAuth } from '../utils/api-requests';
// import {
//   getEnterpriseAccountToken,
//   generateGitHubAPIUrl,
// } from '../utils/helpers';
// import Constants from '../utils/constants';
// import { SettingsState } from '../../types';

// // Single Notification

// export const MARK_NOTIFICATION = makeAsyncActionSet('MARK_NOTIFICATION');
// export function markNotification(id, hostname) {
//   return (dispatch, getState: () => AppState) => {
//     const url = `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`;

//     const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
//     const entAccounts = getState().auth.enterpriseAccounts;
//     const token = isEnterprise
//       ? getEnterpriseAccountToken(hostname, entAccounts)
//       : getState().auth.token;

//     dispatch({ type: MARK_NOTIFICATION.REQUEST });

//     return apiRequestAuth(url, Methods.PATCH, token, {})
//       .then(function (response) {
//         dispatch({
//           type: MARK_NOTIFICATION.SUCCESS,
//           meta: { id, hostname },
//         });
//       })
//       .catch(function (error) {
//         dispatch({
//           type: MARK_NOTIFICATION.FAILURE,
//           payload: error.response.data,
//         });
//       });
//   };
// }

// export const UNSUBSCRIBE_NOTIFICATION = makeAsyncActionSet(
//   'UNSUBSCRIBE_NOTIFICATION'
// );
// export function unsubscribeNotification(id, hostname) {
//   return (dispatch, getState: () => AppState) => {
//     const markReadURL = `${generateGitHubAPIUrl(
//       hostname
//     )}notifications/threads/${id}`;
//     const unsubscribeURL = `${generateGitHubAPIUrl(
//       hostname
//     )}notifications/threads/${id}/subscription`;

//     const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
//     const entAccounts = getState().auth.enterpriseAccounts;
//     const token = isEnterprise
//       ? getEnterpriseAccountToken(hostname, entAccounts)
//       : getState().auth.token;

//     dispatch({ type: UNSUBSCRIBE_NOTIFICATION.REQUEST });

//     return apiRequestAuth(unsubscribeURL, Methods.PUT, token, { ignore: true })
//       .then((response) => {
//         // The GitHub notifications API doesn't automatically mark things as read
//         // like it does in the UI, so after unsubscribing we also need to hit the
//         // endpoint to mark it as read.
//         return apiRequestAuth(markReadURL, Methods.PATCH, token, {});
//       })
//       .then((response) => {
//         dispatch({
//           type: UNSUBSCRIBE_NOTIFICATION.SUCCESS,
//           meta: { id, hostname },
//         });
//       })
//       .catch((error) => {
//         dispatch({
//           type: UNSUBSCRIBE_NOTIFICATION.FAILURE,
//           payload: error.response.data,
//         });
//       });
//   };
// }

// // Repo's Notification

// export const MARK_REPO_NOTIFICATION = makeAsyncActionSet(
//   'MARK_REPO_NOTIFICATION'
// );
// export function markRepoNotifications(repoSlug, hostname) {
//   return (dispatch, getState: () => AppState) => {
//     const url = `${generateGitHubAPIUrl(
//       hostname
//     )}repos/${repoSlug}/notifications`;

//     const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
//     const entAccounts = getState().auth.enterpriseAccounts;
//     const token = isEnterprise
//       ? getEnterpriseAccountToken(hostname, entAccounts)
//       : getState().auth.token;

//     dispatch({ type: MARK_REPO_NOTIFICATION.REQUEST });

//     return apiRequestAuth(url, Methods.PUT, token, {})
//       .then(function (response) {
//         dispatch({
//           type: MARK_REPO_NOTIFICATION.SUCCESS,
//           payload: response.data,
//           meta: { hostname, repoSlug },
//         });
//       })
//       .catch(function (error) {
//         dispatch({
//           type: MARK_REPO_NOTIFICATION.FAILURE,
//           payload: error.response.data,
//         });
//       });
//   };
// }
