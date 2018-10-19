import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import RepositoryNotifications from './repository';

import { markAccountNotifications } from '../actions';

export class AccountNotifications extends React.Component {
  static propTypes = {
    hostname: PropTypes.string.isRequired,
    notifications: PropTypes.any.isRequired,
    markAccountNotifications: PropTypes.func.isRequired,
  };

  markAllAsRead = () => {
    this.props.markAccountNotifications(this.props.hostname);
  };

  render() {
    const { hostname, notifications } = this.props;

    const groupedNotifications = notifications.groupBy(object =>
      object.getIn(['repository', 'full_name'])
    );

    return (
      <ReactCSSTransitionGroup
        transitionName="repository"
        transitionEnter={false}
        transitionLeaveTimeout={325}
      >
        <div className="account p-2">
          {hostname}
          {notifications.isEmpty()
            ? <span className="octicon octicon-chevron-left ml-2" />
            : <span
                title="Mark All as Read"
                className="octicon octicon-check ml-2"
                onClick={() => this.markAllAsRead()}
              />}
        </div>

        {groupedNotifications.valueSeq().map(obj => {
          const repoSlug = obj.first().getIn(['repository', 'full_name']);
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

export function mapStateToProps(state) {
  return {
    markOnClick: state.settings.get('markOnClick'),
  };
}

export default connect(null, dispatch => ({
  markAccountNotifications: hostname => {
    const confirmed = confirm(
      'Are you sure you want to mark all unread notifications as read?'
    );
    if (confirmed) {
      dispatch(markAccountNotifications(hostname));
    }
  },
}))(AccountNotifications);
