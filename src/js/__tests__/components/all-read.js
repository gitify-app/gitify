import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import AllRead from '../../components/all-read';

function setup() {
  const props = {};
  const wrapper = mount(<AllRead {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/all-read.js', function () {

  it('should render itself & its children', function () {

    sinon.spy(AllRead.prototype, 'componentDidMount');

    const { wrapper } = setup();

    expect(wrapper).to.exist;
    expect(AllRead.prototype.componentDidMount).to.have.been.calledOnce;
    expect(wrapper.find('h4').text()).to.equal('No new notifications.');

    AllRead.prototype.componentDidMount.restore();

  });

});
