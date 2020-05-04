import * as _ from 'lodash';
import {
  NOTIFICATIONS,
  MARK_NOTIFICATION,
  MARK_REPO_NOTIFICATION,
  UNSUBSCRIBE_NOTIFICATION,
} from '../actions';
import { LOGOUT } from '../../types/actions';
import { Notification } from '../../types/github';
import { NotificationsState } from '../../types/reducers';

const initialState: NotificationsState = {
  response: [],
  isFetching: false,
  failed: false,
};

export default function reducer(
  state = initialState,
  action
): NotificationsState {
  switch (action.type) {
    case NOTIFICATIONS.REQUEST:
      return { ...state, isFetching: true, failed: false };
    case NOTIFICATIONS.SUCCESS:
      return { ...state, isFetching: false, response: action.payload };
    case NOTIFICATIONS.FAILURE:
      return { ...state, isFetching: false, failed: true, response: [] };
    case MARK_NOTIFICATION.SUCCESS:
    case UNSUBSCRIBE_NOTIFICATION.SUCCESS:
      const accountIndex = state.response.findIndex(
        (obj) => obj.hostname === action.meta.hostname
      );

      return _.updateWith(
        { ...state },
        `[response][${accountIndex}][notifications]`,
        (accNotifications: Notification[]) => {
          return accNotifications.filter(
            (notification) => notification.id !== action.meta.id
          );
        }
      );
    case MARK_REPO_NOTIFICATION.SUCCESS:
      const accNotificationsRepoIndex = state.response.findIndex(
        (obj) => obj.hostname === action.meta.hostname
      );

      return _.updateWith(
        { ...state },
        `[response][${accNotificationsRepoIndex}][notifications]`,
        (accNotifications) => {
          return accNotifications.filter(
            (notification) =>
              notification.repository.full_name !== action.meta.repoSlug
          );
        }
      );
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
