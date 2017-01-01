import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import { App, mapStateToProps } from '../../containers/app';

describe('containers/app.js', function () {
  it('should render itself & its children', function () {
    const props = {
      location: '/home'
    };
    const wrapper = shallow(<App {...props} />);

    expect(wrapper).toBeDefined();
  });

  it('test the mapStateToProps function', () => {
    const state = {
      isFetching: false,
      showSettingsModal: true
    };

    const ownProps = {
      showId: 1234
    };

    const props = mapStateToProps(state, ownProps);

    expect(props.isFetching).toBeFalsy();
    expect(props.showSettingsModal).toBeTruthy();
  });
});
