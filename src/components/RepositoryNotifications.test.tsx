import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockGitHubCloudAccount, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import type { Link } from '../types';
import {
  mockGitHubNotifications,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';
import * as comms from '../utils/comms';
import { RepositoryNotifications } from './RepositoryNotifications';

jest.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('components/Repository.tsx', () => {
  const markRepoNotificationsRead = jest.fn();
  const markRepoNotificationsDone = jest.fn();

  const props = {
    account: mockGitHubCloudAccount,
    repoName: 'gitify-app/notifications-test',
    repoNotifications: mockGitHubNotifications,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', () => {
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByText(props.repoName));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('should mark a repo as read', () => {
    render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings }, markRepoNotificationsRead }}
      >
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('Mark Repository as Read'));

    expect(markRepoNotificationsRead).toHaveBeenCalledWith(
      mockSingleNotification,
    );
  });

  it('should mark a repo as done', () => {
    render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings }, markRepoNotificationsDone }}
      >
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('Mark Repository as Done'));

    expect(markRepoNotificationsDone).toHaveBeenCalledWith(
      mockSingleNotification,
    );
  });

  it('should use default repository icon when avatar is not available', () => {
    props.repoNotifications[0].repository.owner.avatar_url = '' as Link;

    const tree = render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should toggle account notifications visibility', async () => {
    await act(async () => {
      render(<RepositoryNotifications {...props} />);
    });

    fireEvent.click(screen.getByTitle('Hide repository notifications'));

    const tree = render(<RepositoryNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
