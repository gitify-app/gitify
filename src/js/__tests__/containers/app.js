import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { App, mapStateToProps } from '../../containers/app';

describe('containers/app.js', () => {
  it('should render itself & its children', () => {
    const props = {
      location: '/home'
    };
    const wrapper = shallow(<App {...props} />);

    expect(wrapper).toBeDefined();
  });

  it('test the mapStateToProps', () => {
    const state = {
      notifications: Map({
        isFetching: false,
      }),
      settings: Map({
        showSettingsModal: true
      }),
    };

    const props = mapStateToProps(state);

    expect(props.isFetching).toBeFalsy();
    expect(props.showSettingsModal).toBeTruthy();
  });
});
