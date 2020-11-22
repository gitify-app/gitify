import * as React from 'react';
import * as _ from 'lodash';
import styled from 'styled-components';
import { ChevronDownIcon, ChevronLeftIcon } from '@primer/octicons-react';

import { Notification } from '../../types/github';
import RepositoryNotifications from './repository';

const Account = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.primaryDark};
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
    .groupBy((obj) => obj.repository.full_name)
    .sortBy((_, key) => key)
    .value();

  const Chevron = notifications.length > 0 ? ChevronDownIcon : ChevronLeftIcon;

  return (
    <>
      {showAccountHostname && (
        <Account>
          {hostname}

          <Chevron size={20} />
        </Account>
      )}

      {Object.values(groupedNotifications).map((repoNotifications) => {
        const repoSlug = repoNotifications[0].repository.full_name;

        return (
          <RepositoryNotifications
            key={repoSlug}
            hostname={hostname}
            repoName={repoSlug}
            repoNotifications={repoNotifications}
          />
        );
      })}
    </>
  );
};
