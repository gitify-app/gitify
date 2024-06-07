import { render } from '@testing-library/react';
import { mockGitHubCloudAccount } from '../__mocks__/state-mocks';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./Repository', () => ({
  RepositoryNotifications: () => <div>Repository</div>,
}));

describe('components/AccountNotifications.tsx', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
    };

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
    };

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
