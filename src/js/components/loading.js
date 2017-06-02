import React from 'react';
import { connect } from 'react-redux';
import NProgress from 'nprogress';

export class Loading extends React.PureComponent {
  componentDidMount() {
    NProgress.configure({
      showSpinner: false
    });

    if (this.props.isLoading) {
      NProgress.start();
    }
  }

  componentWillUnmount() {
    NProgress.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }

  render() {
    return null;
  };
};


export function mapStateToProps(state) {
  return {
    isLoading: state.notifications.get('isFetching')
  };
};

export default connect(mapStateToProps, null)(Loading);
