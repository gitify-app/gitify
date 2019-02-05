import React from 'react'; // eslint-disable-line no-unused-vars
import { List, Map } from 'immutable';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { NotificationsRoute, mapStateToProps } from './notifications';
import { mockedNotificationsRecuderData } from './../__mocks__/mockedData';

jest.mock('../components/notifications');

describe('routes/notification.js', () => {
  const props = {
    failed: false,
    accountNotifications: mockedNotificationsRecuderData,
    hasNotifications: true,
  };

  it('should test the mapStateToProps method', () => {
    const state = {
      notifications: Map({
        response: mockedNotificationsRecuderData,
        failed: false,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.failed).toBeFalsy();
    expect(mappedProps.accountNotifications).toEqual(
      mockedNotificationsRecuderData
    );
    expect(mappedProps.hasNotifications).toBeTruthy();
  });

  it('should render itself & its children (with notifications)', () => {
    const tree = renderer.create(<NotificationsRoute {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children (all read notifications)', () => {
    const caseProps = {
      ...props,
      hasNotifications: false,
      accountNotifications: List(),
    };

    const wrapper = shallow(<NotificationsRoute {...caseProps} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('AllRead')).toHaveLength(1);
  });

  it('should render itself & its children (error page - oops)', () => {
    const caseProps = {
      ...props,
      failed: true,
    };

    const wrapper = shallow(<NotificationsRoute {...caseProps} />);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('Oops')).toHaveLength(1);
  });
});
