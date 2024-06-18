import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockGitHubCloudAccount } from '../__mocks__/state-mocks';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import * as links from '../utils/links';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>Repository Notifications</div>,
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

  it('should toggle account notifications visibility', async () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
    };

    await act(async () => {
      render(<AccountNotifications {...props} />);
    });

    fireEvent.click(screen.getByTitle('Hide account notifications'));

    const tree = render(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
