import * as React from 'react';
import * as _ from 'lodash';
import styled from 'styled-components';
import Octicon, { ChevronDown, ChevronLeft } from '@primer/octicons-react';

import { Notification } from '../../types/github';
import RepositoryNotifications from './repository';

const Account = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.primaryDark};
  color: white;
  font-size: 0.9rem;

  .octicon {
    margin-left: 1rem;
  }
`;

interface IProps {
  hostname: string;
  notifications: Notification[];
  showAccountHostname: boolean;
}

export const AccountNotifications = (props: IProps) => {
  const { hostname, showAccountHostname, notifications } = props;

  const groupedNotifications = _(notifications)
    .groupBy(obj => obj.repository.full_name)
    .sortBy((_, key) => key)
    .value();

  return (
    <>
      {showAccountHostname && (
        <Account>
          {hostname}

          <Octicon
            icon={notifications.length > 0 ? ChevronDown : ChevronLeft}
            size={20}
          />
        </Account>
      )}

      {Object.values(groupedNotifications).map(repoNotifications => {
        const repoSlug = repoNotifications[0].repository.full_name;

        return (
          <RepositoryNotifications
            key={repoSlug}
            hostname={hostname}
            repo={repoNotifications}
            repoName={repoSlug}
          />
        );
      })}
    </>
  );
};
