import React from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from '../actions';
import Loading from '../components/loading';
import SettingsModal from '../components/settings-modal';
import Sidebar from '../components/sidebar';

export class App extends React.Component {
  render() {
    const { isFetching, showSettingsModal } = this.props;

    return (
      <div className="wrapper">
        <Loading isLoading={isFetching} />
        <Sidebar />
        {this.props.children}

        <SettingsModal isOpen={showSettingsModal} />
      </div>
    );
  };
};

export function mapStateToProps(state) {
  return {
    isFetching: state.notifications.get('isFetching'),
    showSettingsModal: state.settings.get('showSettingsModal')
  };
};

export default connect(mapStateToProps, { fetchNotifications })(App);
