import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { SearchBar } from '../../components/search';

function setup(props) {
  const wrapper = mount(<SearchBar {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/search.js', function () {

  it('should render itself & its children', function () {

    const props = {
      searchNotifications: sinon.spy(),
      clearSearch: sinon.spy(),
      showSearch: true,
      query: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-x').length).to.equal(0);

    wrapper.find('input').props().onChange({target: {value: 'hello'}});
    expect(wrapper.props().searchNotifications.calledOnce).to.be.true;

  });

  it('should hide the search bar if not showSearch', function () {

    const props = {
      searchNotifications: sinon.spy(),
      clearSearch: sinon.spy(),
      showSearch: false,
      query: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    expect(wrapper.find('.container-fluid').length).to.equal(1);
    expect(wrapper.find('.search-bar').length).to.equal(0);

  });

  it('should show the clear icon/button', function () {

    const props = {
      searchNotifications: sinon.spy(),
      clearSearch: sinon.spy(),
      showSearch: true,
      query: 'hello'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('input').props().onChange({target: {value: 'hello'}});
    expect(wrapper.find('.octicon-x').length).to.equal(1);

  });

  it('should test the componentWillReceiveProps function', function () {

    sinon.spy(SearchBar.prototype, 'componentWillReceiveProps');

    const props = {
      searchNotifications: sinon.spy(),
      clearSearch: sinon.spy(),
      showSearch: true,
      query: 'hello'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.setProps({showSearch: false});

    expect(wrapper.props().clearSearch.calledOnce).to.be.true;
    expect(SearchBar.prototype.componentWillReceiveProps.calledOnce).to.be.true;

  });

});
