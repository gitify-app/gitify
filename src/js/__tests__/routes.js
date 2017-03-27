import React from 'react'; // eslint-disable-line no-unused-vars
import configureMockStore from 'redux-mock-store';
import { Map } from 'immutable';
import { shallow } from 'enzyme';

import getRoutes, { NotFound } from '../routes';

const middlewares = [];
const createMockStore = configureMockStore(middlewares);

describe('routes.js', () => {
  it('should return the routes (logged in)', () => {
    const store = createMockStore({ auth: Map({token: 'HELLO'}) });
    const routes = getRoutes(store);

    expect(routes).toBeDefined();
    expect(routes.props.path).toBe('/');
    expect(routes.props.children.length).toBe(5);
  });

  it('should return the routes (logged out)', () => {
    const store = createMockStore({ auth: Map({token: null}) });
    const routes = getRoutes(store);

    expect(routes).toBeDefined();
    expect(routes.props.path).toBe('/');
    expect(routes.props.children.length).toBe(5);
  });

  it('should render the NotFound component', () => {
    const props = {};
    const wrapper = shallow(<NotFound {...props} />);

    expect(wrapper.find('h2').text()).toBe('Not found');
  });
});
