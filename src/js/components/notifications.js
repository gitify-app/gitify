import React from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import RepositoryNotifications from './repository';

const getRepoSlug = obj => obj.first().getIn(['repository', 'full_name']);

const notificationSorter = (a, b) =>
  getRepoSlug(a).localeCompare(getRepoSlug(b));

export default class AccountNotifications extends React.Component {
  static propTypes = {
    hostname: PropTypes.string.isRequired,
    notifications: PropTypes.any.isRequired,
  };

  render() {
    const { hostname, notifications } = this.props;

    const groupedNotifications = notifications.groupBy(object =>
      object.getIn(['repository', 'full_name'])
    );

    const sortedGroupedNotifications = groupedNotifications
      .valueSeq()
      .sort(notificationSorter);

    return (
      <ReactCSSTransitionGroup
        transitionName="repository"
        transitionEnter={false}
        transitionLeaveTimeout={325}
      >
        <div className="account p-2">
          {hostname}
          <span
            className={`octicon octicon-chevron-${notifications.isEmpty()
              ? 'left'
              : 'down'} ml-2`}
          />
        </div>

        {sortedGroupedNotifications.map(obj => {
          const repoSlug = getRepoSlug(obj);
          return (
            <RepositoryNotifications
              hostname={hostname}
              repo={obj}
              repoName={repoSlug}
              key={repoSlug}
            />
          );
        })}
      </ReactCSSTransitionGroup>
    );
  }
}
