import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubCloudGitifyNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import type { Link } from '../../types';

import * as comms from '../../utils/comms';
import {
  RepositoryNotifications,
  type RepositoryNotificationsProps,
} from './RepositoryNotifications';

jest.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('renderer/components/notifications/RepositoryNotifications.tsx', () => {
  const markNotificationsAsReadMock = jest.fn();
  const markNotificationsAsDoneMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

    const tree = renderWithAppContext(<RepositoryNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - all notifications are read', () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications.map((n) => ({
        ...n,
        unread: false,
      })),
    };

    const tree = renderWithAppContext(<RepositoryNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', async () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

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
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

    renderWithAppContext(<RepositoryNotifications {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsRead: markNotificationsAsReadMock,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    expect(markNotificationsAsReadMock).toHaveBeenCalledWith(
      mockGitHubCloudGitifyNotifications,
    );
  });

  it('should mark a repo as done', async () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

    renderWithAppContext(<RepositoryNotifications {...props} />, {
      settings: { ...mockSettings },
      markNotificationsAsDone: markNotificationsAsDoneMock,
    });

    await userEvent.click(screen.getByTestId('repository-mark-as-done'));

    expect(markNotificationsAsDoneMock).toHaveBeenCalledWith(
      mockGitHubCloudGitifyNotifications,
    );
  });

  it('should use default repository icon when avatar is not available', () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

    props.repoNotifications[0].repository.owner.avatarUrl = '' as Link;

    const tree = renderWithAppContext(<RepositoryNotifications {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should toggle repository notifications visibility', async () => {
    const props: RepositoryNotificationsProps = {
      repoName: 'gitify-app/notifications-test',
      repoNotifications: mockGitHubCloudGitifyNotifications,
    };

    await act(async () => {
      renderWithAppContext(<RepositoryNotifications {...props} />);
    });

    await userEvent.click(screen.getByTestId('repository-toggle'));

    const tree = renderWithAppContext(<RepositoryNotifications {...props} />);
    expect(tree.container).toMatchSnapshot();
  });
});
