import axios from 'axios';
import type { SettingsState } from '../../types';
import {
  getAuthenticatedUser,
  getRootHypermediaLinks,
  headNotifications,
  ignoreNotificationThreadSubscription,
  listNotificationsForAuthenticatedUser,
  markNotificationThreadAsDone,
  markNotificationThreadAsRead,
  markRepositoryNotificationsAsRead,
} from './client';

jest.mock('axios');

const mockGitHubHostname = 'github.com';
const mockEnterpriseHostname = 'example.com';
const mockToken = 'yourAuthToken';
const mockThreadId = '1234';
const mockRepoSlug = 'gitify-app/notification-test';

describe('utils/api/client.ts', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRootHypermediaLinks', () => {
    it('should fetch root hypermedia links - github', async () => {
      await getRootHypermediaLinks(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should fetch root hypermedia links - enterprise', async () => {
      await getRootHypermediaLinks(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should fetch authenticated user - github', async () => {
      await getAuthenticatedUser(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/user',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should fetch authenticated user - enterprise', async () => {
      await getAuthenticatedUser(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/user',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('headNotifications', () => {
    it('should fetch notifications head - github', async () => {
      await headNotifications(mockGitHubHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications',
        method: 'HEAD',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should fetch notifications head - enterprise', async () => {
      await headNotifications(mockEnterpriseHostname, mockToken);

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/notifications',
        method: 'HEAD',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('listNotificationsForAuthenticatedUser', () => {
    const mockSettings: Partial<SettingsState> = {
      participating: true,
    };

    it('should list notifications for user - github', async () => {
      await listNotificationsForAuthenticatedUser(
        mockGitHubHostname,
        mockToken,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://api.github.com/notifications?participating=true',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should list notifications for user - enterprise', async () => {
      await listNotificationsForAuthenticatedUser(
        mockEnterpriseHostname,
        mockToken,
        mockSettings as SettingsState,
      );

      expect(axios).toHaveBeenCalledWith({
        url: 'https://example.com/api/v3/notifications?participating=true',
        method: 'GET',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markNotificationThreadAsRead', () => {
    it('should mark notification thread as read - github', async () => {
      await markNotificationThreadAsRead(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        method: 'PATCH',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark notification thread as read- enterprise', async () => {
      await markNotificationThreadAsRead(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}`,
        method: 'PATCH',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markNotificationThreadAsDone', () => {
    it('should mark notification thread as done - github', async () => {
      await markNotificationThreadAsDone(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}`,
        method: 'DELETE',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark notification thread as done- enterprise', async () => {
      await markNotificationThreadAsDone(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}`,
        method: 'DELETE',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('ignoreNotificationThreadSubscription', () => {
    it('should ignore notification thread subscription - github', async () => {
      await ignoreNotificationThreadSubscription(
        mockThreadId,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/notifications/threads/${mockThreadId}/subscriptions`,
        method: 'PUT',
        data: { ignored: true },
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should ignore notification thread subscription- enterprise', async () => {
      await ignoreNotificationThreadSubscription(
        mockThreadId,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/notifications/threads/${mockThreadId}/subscriptions`,
        method: 'PUT',
        data: { ignored: true },
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });

  describe('markRepositoryNotificationsAsRead', () => {
    it('should mark repository notifications as read - github', async () => {
      await markRepositoryNotificationsAsRead(
        mockRepoSlug,
        mockGitHubHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://api.github.com/repos/${mockRepoSlug}/notifications`,
        method: 'PUT',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });

    it('should mark repository notifications as read - enterprise', async () => {
      await markRepositoryNotificationsAsRead(
        mockRepoSlug,
        mockEnterpriseHostname,
        mockToken,
      );

      expect(axios).toHaveBeenCalledWith({
        url: `https://example.com/api/v3/repos/${mockRepoSlug}/notifications`,
        method: 'PUT',
        data: {},
      });

      expect(axios.defaults.headers.common).toMatchSnapshot();
    });
  });
});
