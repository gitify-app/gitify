import * as React from 'react';
import { render } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import { Map } from 'immutable';
import * as NProgress from 'nprogress';

import { Loading, mapStateToProps } from './loading';

jest.mock('nprogress', () => {
  return {
    configure: jest.fn(),
    start: jest.fn(),
    done: jest.fn(),
    remove: jest.fn(),
  };
});

describe('components/loading.js', function() {
  beforeEach(() => {
    NProgress.configure.mockReset();
    NProgress.start.mockReset();
    NProgress.done.mockReset();
    NProgress.remove.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      notifications: Map({
        isFetching: false,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isLoading).toBeFalsy();
  });

  it('should check that NProgress is getting called in getDerivedStateFromProps (loading)', function() {
    const { container } = render(<Loading isLoading={true} />);

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.start).toHaveBeenCalledTimes(1);
  });

  it('should check that NProgress is getting called in getDerivedStateFromProps (not loading)', function() {
    const { container } = render(<Loading isLoading={false} />);

    expect(container.innerHTML).toBe('');
    expect(NProgress.configure).toHaveBeenCalledTimes(1);
    expect(NProgress.done).toHaveBeenCalledTimes(1);
  });

  it('should remove NProgress on unmount', function() {
    const { unmount } = render(<Loading isLoading={false} />);
    expect(NProgress.remove).toHaveBeenCalledTimes(0);
    unmount();
    expect(NProgress.remove).toHaveBeenCalledTimes(1);
  });
});
