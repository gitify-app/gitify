import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

// import AllRead from '../components/all-read';
// import Oops from '../components/oops';
import AccountNotifications from '../components/notifications';

export class NotificationsRoute extends React.Component {
  render() {
    const { accountNotifications } = this.props;
    const wrapperClass = 'container-fluid main-container notifications';
    // const notificationsEmpty = accountNotifications.isEmpty();
    const notificationsEmpty = false;

    // if (this.props.failed) {
    //   return <Oops />;
    // }

    // if (notificationsEmpty) {
    //   return <AllRead />;
    // };

    return (
      <div className={wrapperClass + (notificationsEmpty ? ' all-read' : '')}>
        <ReactCSSTransitionGroup
          transitionName="repository"
          transitionEnter={false}
          transitionLeaveTimeout={325}>
          {accountNotifications.map((obj, key) => {
            return (
              <AccountNotifications
                key={key}
                hostname={obj.get('hostname')}
                notifications={obj.get('notifications')} />
            );
          })}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
};

export function mapStateToProps(state) {
  return {
    failed: state.notifications.get('failed'),
    accountNotifications: state.notifications.get('response')
  };
};

export default connect(mapStateToProps, null)(NotificationsRoute);
