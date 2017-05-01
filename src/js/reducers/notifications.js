import { Map, List, fromJS } from 'immutable';
import { NOTIFICATIONS, MARK_NOTIFICATION, MARK_REPO_NOTIFICATION } from '../actions';

const initialState = Map({
  response: List(),
  isFetching: false,
  failed: false
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
      return state
        .set('isFetching', true)
        .set('failed', false);
    case NOTIFICATIONS.SUCCESS:
      const accountIndex = state.get('response')
        .findIndex(obj => obj.get('hostname') === action.hostname);

      if (accountIndex === -1) {
        return state
          .set('isFetching', false)
          .update('response', res => res.push(Map({
            hostname: action.hostname,
            notifications: fromJS(action.payload)
          })));
      }

      return state
        .set('isFetching', false)
        .setIn(['response', accountIndex], Map({
          hostname: action.hostname,
          notifications: fromJS(action.payload),
        }));
    case NOTIFICATIONS.FAILURE:
      return state
        .set('isFetching', false)
        .set('failed', true)
        .set('response', List());
    case MARK_NOTIFICATION.SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.get('id') === action.meta.id));
    case MARK_REPO_NOTIFICATION.SUCCESS:
      return state
        .set('response', state.get('response')
          .filterNot((obj) => obj.getIn(['repository', 'full_name']) === action.meta.repoSlug));
    default:
      return state;
  }
};
