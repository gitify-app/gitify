import { render } from '@testing-library/react';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import type { HostName } from '../utils/branded-types';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./Repository', () => ({
  RepositoryNotifications: () => <div>Repository</div>,
}));

describe('components/AccountNotifications.tsx', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      hostname: 'github.com' as HostName,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
    };

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com' as HostName,
      notifications: [],
      showAccountHostname: true,
    };

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
