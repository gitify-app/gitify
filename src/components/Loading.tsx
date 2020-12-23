import { useContext, useEffect } from 'react';
import NProgress from 'nprogress';

import { AppContext } from '../context/App';

export const Loading = () => {
  const { isFetching } = useContext(AppContext);

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
