import React from 'react'; // eslint-disable-line no-unused-vars
import configureMockStore from 'redux-mock-store';
import { Map } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import getRoutes, { NotFound } from '../routes';

const middlewares = [];
const createMockStore = configureMockStore(middlewares);

describe('routes.js', () => {

  it('should return the routes (logged in)', () => {

    const store = createMockStore({ auth: Map({token: 'HELLO'}) });
    const routes = getRoutes(store);

    expect(routes).to.be.ok;
    expect(routes.props.path).to.equal('/');
    expect(routes.props.children.length).to.equal(5);

  });

  it('should return the routes (logged out)', () => {

    const store = createMockStore({ auth: Map({token: null}) });
    const routes = getRoutes(store);

    expect(routes).to.be.ok;
    expect(routes.props.path).to.equal('/');
    expect(routes.props.children.length).to.equal(5);

  });

  it('should render the NotFound component', () => {

    const props = {};
    const wrapper = shallow(<NotFound {...props} />);

    expect(wrapper.find('h2').text()).to.equal('Not found');

  });

});
