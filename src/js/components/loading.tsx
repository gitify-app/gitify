import * as React from 'react';
import * as NProgress from 'nprogress';
import { AppState } from '../../types/reducers';
import { connect } from 'react-redux';

export const Loading = ({ isLoading }: { isLoading: boolean }) => {
  React.useEffect(() => {
    NProgress.configure({
      showSpinner: false,
    });

    return () => {
      NProgress.remove();
    };
  }, []);

  React.useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading]);

  return null;
};

export function mapStateToProps(state: AppState) {
  return {
    isLoading: state.notifications.isFetching,
  };
}

export default connect(mapStateToProps, null)(Loading);
