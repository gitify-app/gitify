import * as React from 'react';
import * as NProgress from 'nprogress';
import { AppState } from '../../types/reducers';
import { connect } from 'react-redux';

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

export function mapStateToProps(state: AppState) {
  return {
    isLoading: state.notifications.isFetching,
  };
}

export default connect(mapStateToProps, null)(Loading);
