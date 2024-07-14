import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockGitHubCloudAccount, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { GroupBy } from '../types';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import * as links from '../utils/links';
import { AccountNotifications } from './AccountNotifications';

jest.mock('./RepositoryNotifications', () => ({
  RepositoryNotifications: () => <div>Repository Notifications</div>,
}));

describe('components/AccountNotifications.tsx', () => {
  it('should render itself (github.com with notifications) - group by repositories', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } }}
      >
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com with notifications) - group by date', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: mockGitHubNotifications,
      showAccountHostname: true,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
      >
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
    };

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open profile when clicked', async () => {
    const openAccountProfileMock = jest
      .spyOn(links, 'openAccountProfile')
      .mockImplementation();

    const props = {
      account: mockGitHubCloudAccount,
      notifications: [],
      showAccountHostname: true,
    };

    await act(async () => {
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
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
      render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <AccountNotifications {...props} />
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Hide account notifications'));

    const tree = render(
      <AppContext.Provider value={{ settings: mockSettings }}>
        <AccountNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
