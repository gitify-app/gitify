import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { List } from 'immutable';

import AccountNotifications from './notifications';
import { mockedGithubNotifications } from '../__mocks__/mockedData';

jest.mock('./repository');

describe('components/notifications.js', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: mockedGithubNotifications,
    };

    const tree = renderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: List(),
    };

    const tree = renderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
