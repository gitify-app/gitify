import TestRenderer from 'react-test-renderer';

import { mockedGitHubNotifications } from '../__mocks__/mockedData';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./Repository', () => ({
  RepositoryNotifications: () => <div>Repository</div>,
}));

describe('components/AccountNotifications.tsx', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: mockedGitHubNotifications,
      showAccountHostname: true,
    };

    const tree = TestRenderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: [],
      showAccountHostname: true,
    };

    const tree = TestRenderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
