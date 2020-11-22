const { shell } = require('electron');

import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { CheckIcon } from '@primer/octicons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { markRepoNotifications } from '../actions';
import { Notification } from '../../types/github';
import NotificationItem from './notification';

const Wrapper = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.grayLight};
  padding: 0.55rem 0.5rem;
`;

const TitleBar = styled.div`
  flex: 1;
  padding: 0 0.5rem;
  margin-top: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  border-radius: 50%;
  margin-right: 0.75rem;
  width: 20px;
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
  repoNotifications: Notification[];
  repoName: string;
  markRepoNotifications: (repoSlug: string, hostname: string) => void;
}

export const RepositoryNotifications: React.FC<IProps> = (props) => {
  const openBrowser = () => {
    const url = props.repoNotifications[0].repository.html_url;
    shell.openExternal(url);
  };

  const markRepoAsRead = () => {
    const { hostname, repoNotifications } = props;
    const repoSlug = repoNotifications[0].repository.full_name;
    props.markRepoNotifications(repoSlug, hostname);
  };

  const { hostname, repoNotifications } = props;
  const avatarUrl = repoNotifications[0].repository.owner.avatar_url;

  return (
    <>
      <Wrapper>
        <TitleBar>
          <Avatar src={avatarUrl} />
          <span onClick={openBrowser}>{props.repoName}</span>
        </TitleBar>

        <IconWrapper>
          <Button onClick={markRepoAsRead}>
            <CheckIcon size={20} aria-label="Mark Repository as Read" />
          </Button>
        </IconWrapper>
      </Wrapper>

      <TransitionGroup>
        {repoNotifications.map((obj) => (
          <CSSTransition key={obj.id} timeout={250} classNames="notification">
            <NotificationItem
              key={obj.id}
              hostname={hostname}
              notification={obj}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </>
  );
};

export default connect(null, { markRepoNotifications })(
  RepositoryNotifications
);
