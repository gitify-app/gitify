import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow, mount } from 'enzyme';
import { App } from '../../containers/app';

function setupShallow() {
  const props = {
    location: '/home'
  };
  const wrapper = shallow(<App {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

function setupMount() {
  const props = {
    location: '/home'
  };
  const wrapper = mount(<App {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};


describe('containers/app.js', function () {

  it('should render itself & its children', function () {

    const { wrapper } = setupShallow();

    expect(wrapper).to.exist;
    expect(wrapper.state().showSearch).to.be.false;

    wrapper.instance().toggleSearch();
    expect(wrapper.state().showSearch).to.be.true;
  });

  it('should mount itself & its children', function () {

    const { wrapper } = setupMount();

    expect(wrapper).to.exist;

    wrapper.instance().handleNetworkStatus();
    expect(wrapper.state().networkConnected).to.be.false;
  });

});
