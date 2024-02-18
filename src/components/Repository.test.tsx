import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';

import { AppContext } from '../context/App';
import { mockedGithubNotifications } from '../__mocks__/mockedData';
import { RepositoryNotifications } from './Repository';

const { shell } = require('electron');

jest.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('components/Repository.tsx', () => {
  const unsubscribeRepository = jest.fn();
  const markRepoNotifications = jest.fn();

  const props = {
    hostname: 'github.com',
    repoName: 'manosim/gitify',
    repoNotifications: mockedGithubNotifications,
  };

  beforeEach(() => {
    markRepoNotifications.mockReset();

    jest.spyOn(shell, 'openExternal');
  });

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', () => {
    const { getByText } = render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(getByText(props.repoName));

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/manosim/notifications-test',
    );
  });

  it('should unsubscribe from the repository', () => {
    const { getByTitle } = render(
      <AppContext.Provider value={{ unsubscribeRepository }}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(getByTitle('Unsubscribe'));

    expect(unsubscribeRepository).toHaveBeenCalledWith(
      'manosim/notifications-test',
      'github.com',
    );
  });

  it('should mark a repo as read', function () {
    const { getByTitle } = render(
      <AppContext.Provider value={{ markRepoNotifications }}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(getByTitle('Mark Repository as Read'));

    expect(markRepoNotifications).toHaveBeenCalledWith(
      'manosim/notifications-test',
      'github.com',
    );
  });
});
