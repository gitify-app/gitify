import React from 'react';
import { render } from '@testing-library/react';
import NProgress from 'nprogress';

import { Loading } from './loading';
import { NotificationsContext } from '../context/Notifications';

jest.mock('nprogress', () => {
  return {
    configure: jest.fn(),
    start: jest.fn(),
    done: jest.fn(),
    remove: jest.fn(),
  };
});

describe('components/Loading.js', () => {
  beforeEach(() => {
    NProgress.configure.mockReset();
    NProgress.start.mockReset();
    NProgress.done.mockReset();
    NProgress.remove.mockReset();
  });

  it('should check that NProgress is getting called in when isFetching changes (loading)', () => {
    const { container } = render(
      <NotificationsContext.Provider value={{ isFetching: true }}>
        <Loading />
      </NotificationsContext.Provider>
    );

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.start).toHaveBeenCalledTimes(1);
  });

  it('should check that NProgress is getting called in when isFetching changes (not loading)', () => {
    const { container } = render(
      <NotificationsContext.Provider value={{ isFetching: false }}>
        <Loading />
      </NotificationsContext.Provider>
    );

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.done).toHaveBeenCalledTimes(1);
  });

  it('should remove NProgress on unmount', () => {
    const { unmount } = render(
      <NotificationsContext.Provider value={{ isFetching: true }}>
        <Loading />
      </NotificationsContext.Provider>
    );
    expect(NProgress.remove).toHaveBeenCalledTimes(0);
    unmount();
    expect(NProgress.remove).toHaveBeenCalledTimes(1);
  });
});
