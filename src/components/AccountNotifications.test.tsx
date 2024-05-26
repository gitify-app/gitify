import { render } from '@testing-library/react';
import { mockedGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
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

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: [],
      showAccountHostname: true,
    };

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
