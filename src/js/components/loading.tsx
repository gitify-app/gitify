import * as React from 'react';
import { connect } from 'react-redux';
import NProgress from 'nprogress';

interface IProps {
  isLoading: boolean;
}

export class Loading extends React.PureComponent<IProps> {
  state = {};

  componentDidMount() {
    NProgress.configure({
      showSpinner: false,
    });

    if (this.props.isLoading) {
      NProgress.start();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return null;
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
