import * as React from 'react';
import { connect } from 'react-redux';
import * as NProgress from 'nprogress';

interface IProps {
  isLoading: boolean;
}

export class Loading extends React.PureComponent<IProps> {
  state = {};

  componentDidMount() {
    NProgress.configure({
      showSpinner: false,
    });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return {};
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
