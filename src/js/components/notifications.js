import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

import AllRead from './all-read';
import Oops from './oops';
import Repository from './repository';

export class NotificationsPage extends React.Component {
  render() {
    const wrapperClass = 'container-fluid main-container notifications';
    const notificationsEmpty = this.props.notifications.isEmpty();

    if (this.props.failed) {
      return <Oops />;
    }

    if (notificationsEmpty) {
      return <AllRead />;
    };

    const groupedNotifications = this.props.notifications.groupBy((object) => (
      object.getIn(['repository', 'full_name']))
    );

    return (
      <div className={wrapperClass + (notificationsEmpty ? ' all-read' : '')}>
        <ReactCSSTransitionGroup
          transitionName="repository"
          transitionEnter={false}
          transitionLeaveTimeout={325}>
          {groupedNotifications.valueSeq().map((obj, key) => {
            const repoSlug = obj.first().getIn(['repository', 'full_name']);
            return <Repository repo={obj} repoName={repoSlug} key={repoSlug} />;
          })}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    failed: state.notifications.get('failed'),
    notifications: state.notifications.get('response')
  };
};

export default connect(mapStateToProps, null)(NotificationsPage);
