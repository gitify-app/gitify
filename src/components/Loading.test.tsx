import { render } from '@testing-library/react';
import NProgress from 'nprogress';
import { AppContext } from '../context/App';
import { Loading } from './Loading';

jest.mock('nprogress', () => ({
  configure: jest.fn(),
  start: jest.fn(),
  done: jest.fn(),
  remove: jest.fn(),
}));

describe('components/Loading.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check that NProgress is getting called in when status changes (loading)', () => {
    const { container } = render(
      <AppContext.Provider value={{ status: 'loading' }}>
        <Loading />
      </AppContext.Provider>,
    );

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.start).toHaveBeenCalledTimes(1);
  });

  it('should check that NProgress is getting called in when status changes (not loading)', () => {
    const { container } = render(
      <AppContext.Provider value={{ status: 'success' }}>
        <Loading />
      </AppContext.Provider>,
    );

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.done).toHaveBeenCalledTimes(1);
  });

  it('should remove NProgress on unmount', () => {
    const { unmount } = render(
      <AppContext.Provider value={{ status: 'loading' }}>
        <Loading />
      </AppContext.Provider>,
    );
    expect(NProgress.remove).toHaveBeenCalledTimes(0);
    unmount();
    expect(NProgress.remove).toHaveBeenCalledTimes(1);
  });
});
