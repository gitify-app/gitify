import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';

import { mockedGithubNotifications } from '../__mocks__/mockedData';
import { RepositoryNotifications } from './Repository';
import { NotificationsContext } from '../context/Notifications';

const { shell } = require('electron');

jest.mock('./Notification', () => ({
  NotificationItem: () => <div>NotificationItem</div>,
}));

describe('components/Repository.tsx', () => {
  const markRepoNotifications = jest.fn();

  const props = {
    hostname: 'github.com',
    repoName: 'manosim/gitify',
    repoNotifications: mockedGithubNotifications,
  };

  beforeEach(() => {
    markRepoNotifications.mockReset();

    spyOn(shell, 'openExternal');
  });

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(
      <NotificationsContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </NotificationsContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', () => {
    const { getByText } = render(
      <NotificationsContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </NotificationsContext.Provider>
    );

    fireEvent.click(getByText(props.repoName));

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/manosim/notifications-test'
    );
  });

  it('should mark a repo as read', function () {
    const { getByRole } = render(
      <NotificationsContext.Provider value={{ markRepoNotifications }}>
        <RepositoryNotifications {...props} />
      </NotificationsContext.Provider>
    );

    fireEvent.click(getByRole('button'));

    expect(markRepoNotifications).toHaveBeenCalledWith(
      'manosim/notifications-test',
      'github.com'
    );
  });
});
