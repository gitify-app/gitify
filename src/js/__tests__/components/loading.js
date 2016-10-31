import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import NProgress from 'nprogress';

import Loading from '../../components/loading';

function setupMount(props = {}) {
  const wrapper = mount(<Loading {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

function setupShallow() {
  const props = {};
  const wrapper = shallow(<Loading {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/loading.js', function () {

  beforeEach(() => {
    NProgress.start = sinon.spy();
    NProgress.done = sinon.spy();
    NProgress.remove = sinon.spy();
  });

  afterEach(() => {
    NProgress.start.reset();
    NProgress.done.reset();
    NProgress.remove.reset();
  });

  it('should render itself & its children', function () {

    const { wrapper } = setupShallow();

    expect(wrapper).to.exist;
    expect(wrapper.children().length).to.equal(0);

  });

  it('should mount itself without any children', function () {

    sinon.spy(Loading.prototype, 'componentDidMount');

    const isLoading = true;
    const props = { isLoading };
    const { wrapper } = setupMount(props);

    expect(wrapper).to.exist;
    expect(wrapper.children().length).to.equal(0);

    expect(NProgress.start.callCount).to.equal(1);

    expect(Loading.prototype.componentDidMount.callCount).to.equal(1);

    Loading.prototype.componentDidMount.restore();

  });

  it('should receive props', function () {

    sinon.spy(Loading.prototype, 'componentDidMount');

    const isLoading = true;
    const props = { isLoading };
    const { wrapper } = setupMount(props);

    expect(wrapper).to.exist;
    expect(wrapper.children().length).to.equal(0);
    expect(NProgress.start.callCount).to.equal(1);

    wrapper.setProps({
      ...props,
      isLoading: false
    });
    expect(NProgress.done.callCount).to.equal(1);

    wrapper.setProps({
      ...props,
      isLoading: true
    });
    expect(NProgress.start.callCount).to.equal(2);

    Loading.prototype.componentDidMount.restore();

  });


  it('should unmount the component', function () {

    sinon.spy(Loading.prototype, 'componentWillUnmount');

    const isLoading = true;
    const props = { isLoading };
    const { wrapper } = setupMount(props);

    expect(wrapper).to.exist;
    expect(wrapper.children().length).to.equal(0);

    wrapper.unmount();
    expect(NProgress.remove.callCount).to.equal(1);

    Loading.prototype.componentWillUnmount.restore();

  });

});
