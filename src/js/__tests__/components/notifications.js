import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';

import AccountNotifications from '../../components/notifications';
import { mockedGithubNotifications } from '../../__mocks__/mockedData';

jest.mock('../../components/repository');

describe('components/notifications.js', () => {
  it('should render itself & its children', () => {
    const props = {
      hostname: 'github.com',
      notifications: mockedGithubNotifications,
    };

    const tree = renderer.create(
      <AccountNotifications {...props} />
    );
    expect(tree).toMatchSnapshot();
  });
});
