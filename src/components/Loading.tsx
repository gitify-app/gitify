import React, { useContext, useEffect } from 'react';
import NProgress from 'nprogress';
import { NotificationsContext } from '../context/Notifications';

export const Loading = () => {
  const { isFetching } = useContext(NotificationsContext);

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
    });

    return () => {
      NProgress.remove();
    };
  }, []);

  useEffect(() => {
    if (isFetching) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);

  return null;
};
