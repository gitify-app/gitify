import NProgress from 'nprogress';
import { useContext, useEffect } from 'react';

import { AppContext } from '../context/App';

export const Loading = () => {
  const { status } = useContext(AppContext);

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
    });

    return () => {
      NProgress.remove();
    };
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [status]);

  return null;
};
