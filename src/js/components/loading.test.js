import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow, mount } from 'enzyme';
import { Map } from 'immutable';
import NProgress from 'nprogress';

import { Loading, mapStateToProps } from './loading';

describe('components/loading.js', function() {
  beforeEach(() => {
    NProgress.start = jest.fn();
    NProgress.done = jest.fn();
    NProgress.remove = jest.fn();
  });

  afterEach(() => {
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

  it('should render itself & its children', function() {
    const isLoading = false;
    const caseProps = { isLoading };
    const wrapper = shallow(<Loading {...caseProps} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.children().length).toBe(0);
  });

  it('should mount itself without any children', function() {
    spyOn(Loading.prototype, 'componentDidMount').and.callThrough();

    const isLoading = true;
    const caseProps = { isLoading };
    const wrapper = mount(<Loading {...caseProps} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.children().length).toEqual(0);

    expect(NProgress.start).toHaveBeenCalledTimes(1);
    expect(Loading.prototype.componentDidMount).toHaveBeenCalledTimes(1);
  });

  it('should receive props', function() {
    spyOn(Loading.prototype, 'componentDidMount').and.callThrough();

    const isLoading = true;
    const caseProps = { isLoading };
    const wrapper = mount(<Loading {...caseProps} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.children().length).toEqual(0);
    expect(NProgress.start).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      isLoading: false,
    });
    expect(NProgress.done).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      isLoading: true,
    });
    expect(NProgress.start).toHaveBeenCalledTimes(2);
  });

  it('should unmount the component', function() {
    spyOn(Loading.prototype, 'componentWillUnmount').and.callThrough();

    const isLoading = true;
    const props = { isLoading };
    const wrapper = mount(<Loading {...props} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.children().length).toEqual(0);

    wrapper.unmount();
    expect(NProgress.remove).toHaveBeenCalledTimes(1);
  });
});
