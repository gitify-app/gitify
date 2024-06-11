import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockGitHubCloudAccount } from '../__mocks__/state-mocks';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import * as links from '../utils/links';
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

  it('should open profile when clicked', async () => {
    const openAccountProfileMock = jest.spyOn(links, 'openAccountProfile');

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
    };

    await act(async () => {
      render(<AccountNotifications {...props} />);
    });

    fireEvent.click(screen.getByTitle('Open Profile'));

    expect(openAccountProfileMock).toHaveBeenCalledTimes(1);
    expect(openAccountProfileMock).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });
});
