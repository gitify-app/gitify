const { shell } = require('electron');

import * as React from 'react';
import { connect } from 'react-redux';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Octicon, { Check, Mute, getIconByName } from '@primer/octicons-react';
import styled from 'styled-components';

import { AppState } from '../../types/reducers';
import { formatReason, getNotificationTypeIcon } from '../utils/github-api';
import { generateGitHubWebUrl } from '../utils/helpers';
import { markNotification } from '../actions';
import { Notification } from '../../types/github';

const Wrapper = styled.div`
  display: flex;
  margin: 0;
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid ${(props) => props.theme.grayLight};

  &:hover {
    background-color: ${(props) => props.theme.grayLighter};
  }
`;

const Main = styled.div`
  flex: 1;
  padding: 0 0.5rem;
  overflow: hidden;
`;

const Title = styled.h6`
  margin-top: 0;
  margin-bottom: 0.25rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1rem;
`;

const Details = styled.div`
  font-size: 0.75rem;
  text-transform: text-capitalize;
`;

const IconWrapper = styled.div`
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Button = styled.button`
  background: none;
  border: none;

  .octicon:hover {
    color: ${(props) => props.theme.success};
    cursor: pointer;
  }
`;

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

  const unsubscribe = () => {
    const { hostname, notification } = props;
    props.unsubscribeNotification(notification.id, hostname);
  };

  const { notification } = props;
  const reason = formatReason(notification.reason);
  const typeIcon = getNotificationTypeIcon(notification.subject.type);
  const updatedAt = formatDistanceToNow(parseISO(notification.updated_at), {
    addSuffix: true,
  });

  return (
    <Wrapper>
      <IconWrapper>
        <Octicon
          icon={getIconByName(typeIcon)}
          size={20}
          ariaLabel={notification.subject.type}
        />
      </IconWrapper>
      <Main onClick={() => pressTitle()} role="main">
        <Title>{notification.subject.title}</Title>

        <Details>
          <span title={reason.description}>{reason.type}</span> - Updated{' '}
          {updatedAt}
        </Details>
      </Main>
      <IconWrapper>
        <Button title="Unsubscribe" onClick={() => unsubscribe()}>
          <Octicon icon={Mute} size={20} ariaLabel="Unsubscribe" />
        </Button>
      </IconWrapper>
      <IconWrapper>
        <Button title="Mark as Read" onClick={() => markAsRead()}>
          <Octicon icon={Check} size={20} ariaLabel="Mark as Read" />
        </Button>
      </IconWrapper>
    </Wrapper>
  );
};

export function mapStateToProps(state: AppState) {
  return {
    markOnClick: state.settings.markOnClick,
  };
}

export default connect(mapStateToProps, { markNotification })(NotificationItem);
