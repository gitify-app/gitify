import { type FC, useContext, useEffect } from 'react';

import NProgress from 'nprogress';

import { AppContext } from '../context/App';

export const Loading: FC = () => {
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
