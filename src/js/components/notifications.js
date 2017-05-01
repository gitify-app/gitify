import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Repository from './repository';

export default class RepoNotifications extends React.Component {
  render() {
    const { hostname, notifications } = this.props;

    const groupedNotifications = notifications.groupBy((object) => (
      object.getIn(['repository', 'full_name']))
    );

    return (
      <ReactCSSTransitionGroup
        transitionName="repository"
        transitionEnter={false}
        transitionLeaveTimeout={325}>
        <div className="account p-2">
          {hostname} <span className="octicon octicon-chevron-down ml-2" />
        </div>

        {groupedNotifications.valueSeq().map((obj, key) => {
          const repoSlug = obj.first().getIn(['repository', 'full_name']);
          return <Repository repo={obj} repoName={repoSlug} key={repoSlug} />;
        })}
      </ReactCSSTransitionGroup>
    );
  }
};
