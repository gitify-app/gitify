import { Map, List } from 'immutable';
import {
  NOTIFICATIONS,
  MARK_NOTIFICATION,
  MARK_REPO_NOTIFICATION,
  MARK_ACCOUNT_NOTIFICATION,
  LOGOUT,
} from '../actions';

const initialState = Map({
  response: List(),
  isFetching: false,
  failed: false,
});

// Response Structure
// response: List([
//   Map({
//     hostname: 'github.com',
//     notifications: List([1, 2, 3])
//   }),
//   Map({
//     hostname: 'git-enterprise.hexwebs.com',
//     notifications: List([1, 2, 3])
//   }),
// ]);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS.REQUEST:
      return state.set('isFetching', true).set('failed', false);
    case NOTIFICATIONS.SUCCESS:
      return state.set('isFetching', false).set('response', action.payload);
    case NOTIFICATIONS.FAILURE:
      return state
        .set('isFetching', false)
        .set('failed', true)
        .set('response', List());
    case MARK_NOTIFICATION.SUCCESS:
      const accNotificationsIndex = state
        .get('response')
        .findIndex(obj => obj.get('hostname') === action.meta.hostname);

      return state.updateIn(
        ['response', accNotificationsIndex, 'notifications'],
        notifications => {
          return notifications.filterNot(
            items => items.get('id') === action.meta.id
          );
        }
      );
    case MARK_REPO_NOTIFICATION.SUCCESS:
      const accNotificationsRepoIndex = state
        .get('response')
        .findIndex(obj => obj.get('hostname') === action.meta.hostname);

      return state.updateIn(
        ['response', accNotificationsRepoIndex, 'notifications'],
        notifications => {
          return notifications.filterNot(
            items =>
              items.getIn(['repository', 'full_name']) === action.meta.repoSlug
          );
        }
      );
    case MARK_ACCOUNT_NOTIFICATION.SUCCESS:
      const accNotificationsAccountIndex = state
        .get('response')
        .findIndex(obj => obj.get('hostname') === action.meta.hostname);

      return state.updateIn(
        ['response', accNotificationsAccountIndex, 'notifications'],
        notifications => notifications.clear()
      );
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
