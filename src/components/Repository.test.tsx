import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import { AppContext } from '../context/App';
import { mockGitHubNotifications } from '../utils/api/__mocks__/response-mocks';
import { RepositoryNotifications } from './Repository';

jest.mock('./NotificationRow', () => ({
  NotificationRow: () => <div>NotificationRow</div>,
}));

describe('components/Repository.tsx', () => {
  const markRepoNotifications = jest.fn();
  const markRepoNotificationsDone = jest.fn();

  const props = {
    hostname: 'github.com',
    repoName: 'gitify-app/notifications-test',
    repoNotifications: mockGitHubNotifications,
  };

  beforeEach(() => {
    markRepoNotifications.mockReset();

    jest.spyOn(shell, 'openExternal');
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
    render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByText(props.repoName));

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/gitify-app/notifications-test',
    );
  });

  it('should mark a repo as read', () => {
    render(
      <AppContext.Provider value={{ markRepoNotifications }}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('Mark Repository as Read'));

    expect(markRepoNotifications).toHaveBeenCalledWith(
      'gitify-app/notifications-test',
      'github.com',
    );
  });

  it('should mark a repo as done', () => {
    render(
      <AppContext.Provider value={{ markRepoNotificationsDone }}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTitle('Mark Repository as Done'));

    expect(markRepoNotificationsDone).toHaveBeenCalledWith(
      'gitify-app/notifications-test',
      'github.com',
    );
  });

  it('should use default repository icon when avatar is not available', () => {
    props.repoNotifications[0].repository.owner.avatar_url = '';

    const tree = render(
      <AppContext.Provider value={{}}>
        <RepositoryNotifications {...props} />
      </AppContext.Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
