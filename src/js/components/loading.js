import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NProgress from 'nprogress';

export class Loading extends React.PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    NProgress.configure({
      showSpinner: false,
    });

    if (this.props.isLoading) {
      NProgress.start();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }

  componentWillUnmount() {
    NProgress.remove();
  }

  render() {
    return null;
  }
}

export function mapStateToProps(state) {
  return {
    isLoading: state.notifications.get('isFetching'),
  };
}

export default connect(mapStateToProps, null)(Loading);
