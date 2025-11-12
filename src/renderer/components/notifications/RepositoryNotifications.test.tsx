import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mockGitHubCloudAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { Link } from '../../types';
import { mockGitHubNotifications } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { RepositoryNotifications } from './RepositoryNotifications';

vi.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('renderer/components/notifications/RepositoryNotifications.tsx', () => {
  const markNotificationsAsRead = vi.fn();
  const markNotificationsAsDone = vi.fn();

  const props = {
    account: mockGitHubCloudAccount,
    repoName: 'gitify-app/notifications-test',
    repoNotifications: mockGitHubNotifications,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', async () => {
    const openExternalLinkMock = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('open-repository'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('should mark a repo as read', async () => {
    render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings }, markNotificationsAsRead }}
      >
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('repository-mark-as-read'));

    expect(markNotificationsAsRead).toHaveBeenCalledWith(
      mockGitHubNotifications,
    );
  });

  it('should mark a repo as done', async () => {
    render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings }, markNotificationsAsDone }}
      >
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('repository-mark-as-done'));

    expect(markNotificationsAsDone).toHaveBeenCalledWith(
      mockGitHubNotifications,
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

  it('should toggle repository notifications visibility', async () => {
    await act(async () => {
      render(<RepositoryNotifications {...props} />);
    });

    await userEvent.click(screen.getByTestId('repository-toggle'));

    const tree = render(<RepositoryNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
