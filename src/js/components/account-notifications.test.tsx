import * as React from 'react';
import * as TestRendener from 'react-test-renderer';

import { AccountNotifications } from './account-notifications';
import { mockedGithubNotifications } from '../__mocks__/mockedData';

jest.mock('./repository');

describe('components/account-notifications.tsx', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: mockedGithubNotifications.toJS(),
    };

    const tree = TestRendener.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: [],
    };

    const tree = TestRendener.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
