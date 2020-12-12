const { shell } = require('electron');

import * as React from 'react';
import { connect } from 'react-redux';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CheckIcon, MuteIcon } from '@primer/octicons-react';

import { AppState } from '../../types/reducers';
import { formatReason, getNotificationTypeIcon } from '../utils/github-api';
import { generateGitHubWebUrl } from '../utils/helpers';
import { markNotification, unsubscribeNotification } from '../actions';
import { Notification } from '../../types/github';

interface IProps {
  hostname: string;
  notification: Notification;
  markOnClick: boolean;
  markNotification: (id: string, hostname: string) => void;
  unsubscribeNotification?: (id: string, hostname: string) => void;
}

export const NotificationItem: React.FC<IProps> = (props) => {
  const pressTitle = () => {
    openBrowser();

    if (props.markOnClick) {
      markAsRead();
    }
  };

  const openBrowser = () => {
    // Some Notification types from GitHub are missing urls in their subjects.
    if (props.notification.subject.url) {
      const url = generateGitHubWebUrl(props.notification.subject.url);
      shell.openExternal(url);
    }
  };

  const markAsRead = () => {
    const { hostname, notification } = props;
    props.markNotification(notification.id, hostname);
  };

  const unsubscribe = (event: React.MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    const { hostname, notification } = props;
    props.unsubscribeNotification(notification.id, hostname);
  };

  const { notification } = props;
  const reason = formatReason(notification.reason);
  const NotificationIcon = getNotificationTypeIcon(notification.subject.type);
  const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="flex space-x-2 p-2 bg-white hover:bg-gray-100 border-b border-gray-100">
      <div className="flex justify-center items-center w-8">
        <NotificationIcon size={18} aria-label={notification.subject.type} />
      </div>

      <div
        className="flex-1 overflow-hidden"
        onClick={() => pressTitle()}
        role="main"
      >
        <div className="mb-1 text-sm whitespace-nowrap overflow-ellipsis overflow-hidden">
          {notification.subject.title}
        </div>

        <div className="text-xs text-capitalize">
          <span title={reason.description}>{reason.type}</span> - Updated{' '}
          {updatedAt}
          <button
            className="border-0 bg-none float-right"
            title="Unsubscribe"
            onClick={(e) => unsubscribe(e)}
          >
            <MuteIcon
              className="hover:text-red-500"
              size={13}
              aria-label="Unsubscribe"
            />
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center w-8">
        <button
          className="focus:outline-none"
          title="Mark as Read"
          onClick={() => markAsRead()}
        >
          <CheckIcon
            className="hover:text-green-500"
            size={20}
            aria-label="Mark as Read"
          />
        </button>
      </div>
    </div>
  );
};

export function mapStateToProps(state: AppState) {
  return {
    markOnClick: state.settings.markOnClick,
  };
}

export default connect(mapStateToProps, {
  markNotification,
  unsubscribeNotification,
})(NotificationItem);
