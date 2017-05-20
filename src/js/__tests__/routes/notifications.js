import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import renderer from 'react-test-renderer';

import { NotificationsRoute, mapStateToProps } from '../../Routes/Notifications';
import { mockedNotificationsRecuderData } from '../../__mocks__/mockedData';

jest.mock('../../components/notifications');

describe('routes/notification.js', () => {
  const props = {
    failed: false,
    accountNotifications: mockedNotificationsRecuderData
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
    expect(mappedProps.accountNotifications).toEqual(mockedNotificationsRecuderData);
  });

  it('should render itself & its children', () => {
    const tree = renderer.create(
      <NotificationsRoute {...props} />
    );

    expect(tree).toMatchSnapshot();
  });
});
