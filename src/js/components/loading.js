import React from 'react';
import NProgress from 'nprogress';

export default class Loading extends React.PureComponent {
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
