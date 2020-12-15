import React, { useContext } from 'react';
import * as NProgress from 'nprogress';
import { NotificationsContext } from '../context/Notifications';

export const Loading = () => {
  const { isFetching } = useContext(NotificationsContext);

  React.useEffect(() => {
    NProgress.configure({
      showSpinner: false,
    });

    return () => {
      NProgress.remove();
    };
  }, []);

  React.useEffect(() => {
    if (isFetching) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);

  return null;
};
