const { shell } = require('electron');

import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Octicon, { Check } from '@primer/octicons-react';

import { markRepoNotifications } from '../actions';
import { Notification } from '../../types/github';
import NotificationItem from './notification';

const Wrapper = styled.div`
  display: flex;
  background-color: ${props => props.theme.grayLight};
  padding: 0.5rem 0.5rem;
`;

const TitleBar = styled.div`
  flex: 1;
  padding: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
`;

const Avatar = styled.img`
  border-radius: 50%;
  margin-right: 0.5rem;
  width: 25px;
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
    color: ${props => props.theme.success};
    cursor: pointer;
  }
`;

interface IProps {
  hostname: string;
  repo: Notification[];
  repoName: string;
  markRepoNotifications: (repoSlug: string, hostname: string) => void;
}

export const RepositoryNotifications = (props: IProps) => {
  const openBrowser = () => {
    const url = props.repo[0].repository.html_url;
    shell.openExternal(url);
  };

  const markRepoAsRead = () => {
    const { hostname, repo } = props;
    const repoSlug = repo[0].repository.full_name;
    props.markRepoNotifications(repoSlug, hostname);
  };

  const { hostname, repo } = props;
  const avatarUrl = repo[0].repository.owner.avatar_url;

  return (
    <>
      <Wrapper>
        <TitleBar>
          <Avatar src={avatarUrl} />
          <span onClick={openBrowser}>{props.repoName}</span>
        </TitleBar>

        <IconWrapper>
          <Button onClick={markRepoAsRead}>
            <Octicon
              icon={Check}
              size={20}
              ariaLabel="Mark Repository as Read"
            />
          </Button>
        </IconWrapper>
      </Wrapper>

      {repo.map(obj => (
        <NotificationItem key={obj.id} hostname={hostname} notification={obj} />
      ))}
    </>
  );
};

export default connect(null, { markRepoNotifications })(
  RepositoryNotifications
);
