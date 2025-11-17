import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { Link } from '../../types';
import { mockGitHubNotifications } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { RepositoryNotifications } from './RepositoryNotifications';

jest.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('renderer/components/notifications/RepositoryNotifications.tsx', () => {
  const markNotificationsAsRead = jest.fn();
  const markNotificationsAsDone = jest.fn();

  const props = {
    account: mockGitHubCloudAccount,
    repoName: 'gitify-app/notifications-test',
    repoNotifications: mockGitHubNotifications,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = renderWithAppContext(
      <RepositoryNotifications {...props} />,
      {},
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - all notifications are read', () => {
    for (const n of props.repoNotifications) {
      n.unread = false;
    }

    const tree = renderWithAppContext(
      <RepositoryNotifications {...props} />,
      {},
    );

    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', async () => {
    const openExternalLinkSpy = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    renderWithAppContext(<RepositoryNotifications {...props} />);

    await userEvent.click(screen.getByTestId('open-repository'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('should mark a repo as read', async () => {
    renderWithAppContext(<RepositoryNotifications {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    expect(markNotificationsAsRead).toHaveBeenCalledWith(
      mockGitHubNotifications,
    );
  });

  it('should mark a repo as done', async () => {
    renderWithAppContext(<RepositoryNotifications {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsDone,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-done'));

    expect(markNotificationsAsDone).toHaveBeenCalledWith(
      mockGitHubNotifications,
    );
  });

  it('should use default repository icon when avatar is not available', () => {
    props.repoNotifications[0].repository.owner.avatar_url = '' as Link;

    const tree = renderWithAppContext(
      <RepositoryNotifications {...props} />,
      {},
    );

    expect(tree).toMatchSnapshot();
  });

  it('should toggle repository notifications visibility', async () => {
    await act(async () => {
      renderWithAppContext(<RepositoryNotifications {...props} />);
    });

    await userEvent.click(screen.getByTestId('repository-toggle'));

    const tree = renderWithAppContext(<RepositoryNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
