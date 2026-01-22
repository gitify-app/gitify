import { act, renderHook, waitFor } from '@testing-library/react';

import { AxiosError } from 'axios';
import nock from 'nock';

import {
  configureAxiosHttpAdapterForNock,
  type DeepPartial,
} from '../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockAuth, mockSettings, mockState } from '../__mocks__/state-mocks';

import type { ListNotificationsForAuthenticatedUserResponse } from '../utils/api/types';

import { Errors } from '../utils/errors';
import * as logger from '../utils/logger';
import * as native from '../utils/notifications/native';
import * as sound from '../utils/notifications/sound';
import { useNotifications } from './useNotifications';

describe('renderer/hooks/useNotifications.ts', () => {
  const rendererLogErrorSpy = jest
    .spyOn(logger, 'rendererLogError')
    .mockImplementation();

  const raiseSoundNotificationSpy = jest
    .spyOn(sound, 'raiseSoundNotification')
    .mockImplementation();

  const raiseNativeNotificationSpy = jest
    .spyOn(native, 'raiseNativeNotification')
    .mockImplementation();

  beforeEach(() => {
    configureAxiosHttpAdapterForNock();

    jest.clearAllMocks();
    // Reset mock notification state between tests since it's mutated
    mockGitifyNotification.unread = true;
  });

  const id = mockGitifyNotification.id;

  describe('fetchNotifications', () => {
    const mockRepository = {
      name: 'notifications-test',
      full_name: 'gitify-app/notifications-test',
      html_url: 'https://github.com/gitify-app/notifications-test',
      owner: {
        login: 'gitify-app',
        avatar_url: 'https://avatar.url',
        type: 'Organization',
      },
    };

    const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
      [
        {
          id: '1',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a check suite workflow.',
            type: 'CheckSuite',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '2',
          unread: true,
          updated_at: '2024-02-26T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a Discussion.',
            type: 'Discussion',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '3',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is an Issue.',
            type: 'Issue',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/3',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/3/comments',
          },
          repository: mockRepository,
        },
        {
          id: '4',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a Pull Request.',
            type: 'PullRequest',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/4',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/4/comments',
          },
          repository: mockRepository,
        },
        {
          id: '5',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is an invitation.',
            type: 'RepositoryInvitation',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '6',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a workflow run.',
            type: 'WorkflowRun',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
      ];

    it('should fetch non-detailed notifications with success', async () => {
      const mockState = {
        auth: mockAuth,
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      };

      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(6);

      expect(result.current.notifications[1].account.hostname).toBe(
        'github.gitify.io',
      );
      expect(result.current.notifications[1].notifications.length).toBe(6);
    });

    it('should fetch detailed notifications with success', async () => {
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      // TODO - Improve this mock response to cover all notifications
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [
                {
                  title: 'This is a Discussion.',
                  stateReason: null,
                  isAnswered: true,
                  url: 'https://github.com/gitify-app/notifications-test/discussions/612',
                  author: {
                    login: 'discussion-creator',
                    url: 'https://github.com/discussion-creator',
                    avatar_url:
                      'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
                    type: 'User',
                  },
                  comments: {
                    nodes: [
                      {
                        databaseId: 2297637,
                        createdAt: '2022-03-04T20:39:44Z',
                        author: {
                          login: 'comment-user',
                          url: 'https://github.com/comment-user',
                          avatar_url:
                            'https://avatars.githubusercontent.com/u/1?v=4',
                          type: 'User',
                        },
                        replies: {
                          nodes: [],
                        },
                      },
                    ],
                  },
                  labels: null,
                },
              ],
            },
          },
        });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications({
          auth: {
            accounts: [mockGitHubCloudAccount],
          },
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          },
        });
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(6);
    });

    it('should fetch notifications with same failures', async () => {
      const code = AxiosError.ERR_BAD_REQUEST;
      const status = 401;
      const message = 'Bad credentials';

      nock('https://api.github.com/')
        .get('/notifications?participating=false&all=false')
        .replyWithError({
          code,
          response: {
            status,
            data: {
              message,
            },
          },
        });

      nock('https://github.gitify.io/api/v3/')
        .get('/notifications?participating=false&all=false')
        .replyWithError({
          code,
          response: {
            status,
            data: {
              message,
            },
          },
        });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.globalError).toBe(Errors.BAD_CREDENTIALS);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(4);
    });

    it('should fetch notifications with different failures', async () => {
      const code = AxiosError.ERR_BAD_REQUEST;

      nock('https://api.github.com/')
        .get('/notifications?participating=false&all=false')
        .replyWithError({
          code,
          response: {
            status: 400,
            data: {
              message: 'Oops! Something went wrong.',
            },
          },
        });

      nock('https://github.gitify.io/api/v3/')
        .get('/notifications?participating=false&all=false')
        .replyWithError({
          code,
          response: {
            status: 401,
            data: {
              message: 'Bad credentials',
            },
          },
        });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.globalError).toBeNull();
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(4);
    });

    it('should play sound when new notifications arrive and playSound is enabled', async () => {
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      const stateWithSound = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: false,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithSound);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });

    it('should show native notification when new notifications arrive and showNotifications is enabled', async () => {
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      const stateWithNotifications = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: false,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithNotifications);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should play sound and show notification when both are enabled', async () => {
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      const stateWithBoth = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithBoth);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should not play sound or show notification when no new notifications', async () => {
      // Return empty notifications - no new notifications to trigger sound/native
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(
          200,
          [] satisfies Partial<ListNotificationsForAuthenticatedUserResponse>,
        );

      const stateWithBoth = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithBoth);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read with success', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(205);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark notifications as read with failure', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should only mark specific notifications as read while keeping others unread', async () => {
      const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '1',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'First notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
          {
            id: '2',
            unread: true,
            updated_at: '2024-01-02T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Second notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      // Fetch notifications
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=true')
        .reply(200, mockNotifications);

      // The mark notification as read endpoint call, only the first notification.
      nock('https://api.github.com/')
        .patch('/notifications/threads/1')
        .reply(205);

      const stateWithFetchRead = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithFetchRead);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].notifications.length).toBe(2);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );
      expect(result.current.notifications[0].notifications[1].unread).toBe(
        true,
      );

      // Mark only the first notification as read
      act(() => {
        result.current.markNotificationsAsRead(stateWithFetchRead, [
          result.current.notifications[0].notifications[0],
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // First notification should be marked as read
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
      // Second notification should remain unread
      expect(result.current.notifications[0].notifications[1].unread).toBe(
        true,
      );
    });

    it('should only update notifications for the correct account when fetchReadNotifications is enabled', async () => {
      const mockCloudNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '1',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Cloud notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      const mockEnterpriseNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '2',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Enterprise notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'enterprise-test',
              full_name: 'myorg/enterprise-test',
              html_url: 'https://github.gitify.io/myorg/enterprise-test',
              owner: {
                login: 'myorg',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      // Fetch notifications for both accounts
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=true')
        .reply(200, mockCloudNotifications);

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false&all=true')
        .reply(200, mockEnterpriseNotifications);

      // The mark notification as read endpoint call.
      nock('https://api.github.com/')
        .patch('/notifications/threads/1')
        .reply(205);

      const stateWithMultipleAccounts = {
        auth: mockAuth,
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithMultipleAccounts);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(2);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );
      expect(result.current.notifications[1].notifications[0].unread).toBe(
        true,
      );

      // Mark only the cloud notification as read
      act(() => {
        result.current.markNotificationsAsRead(
          stateWithMultipleAccounts,
          result.current.notifications[0].notifications,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Cloud notification should be marked as read
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
      // Enterprise notification should remain unread
      expect(result.current.notifications[1].notifications[0].unread).toBe(
        true,
      );
    });

    it('should keep notifications in list when fetchReadNotifications is enabled', async () => {
      const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: mockGitifyNotification.id,
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Test notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      // First fetch notifications to populate the state
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=true')
        .reply(200, mockNotifications);

      // Mock the mark as read endpoint
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(205);

      const stateWithFetchRead = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithFetchRead);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );

      // Now mark as read with fetchReadNotifications enabled
      act(() => {
        result.current.markNotificationsAsRead(
          stateWithFetchRead,
          result.current.notifications[0].notifications,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Notifications should still be in the list but marked as read
      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
    });
  });

  describe('markNotificationsAsDone', () => {
    it('should mark notifications as done with success', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(204);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should not mark as done when account does not support the feature', async () => {
      // GitHub Enterprise Server without version doesn't support mark as done
      const mockEnterpriseNotification = {
        ...mockGitifyNotification,
        account: mockGitHubEnterpriseServerAccount, // No version set
      };

      const { result } = renderHook(() => useNotifications());

      // The API should NOT be called when account doesn't support the feature
      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockEnterpriseNotification,
        ]);
      });

      // Status should remain 'success' (not change to 'loading' since we return early)
      expect(result.current.status).toBe('success');
      // No API calls should have been made - nock will fail if unexpected calls are made
    });

    it('should mark notifications as done with failure', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribeNotification', () => {
    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = false', async () => {
      // The unsubscribe from notification thread endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark notification as read endpoint call.
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(205);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          mockState,
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = true', async () => {
      // The unsubscribe from notification thread endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark notification as done endpoint call.
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(204);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings,
              markAsDoneOnUnsubscribe: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with failure', async () => {
      // The unsubscribe from notification thread endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(400);

      // The mark notification as read endpoint call.
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          mockState,
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should mark as done when markAsDoneOnUnsubscribe is true even with fetchReadNotifications enabled', async () => {
      // The unsubscribe from notification thread endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark notification as done endpoint call.
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(204);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings,
              markAsDoneOnUnsubscribe: true,
              fetchReadNotifications: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark as read when markAsDoneOnUnsubscribe is false and fetchReadNotifications is enabled', async () => {
      // The unsubscribe from notification thread endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark notification as read endpoint call.
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(205);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings,
              markAsDoneOnUnsubscribe: false,
              fetchReadNotifications: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('removeAccountNotifications', () => {
    it('should remove notifications for a specific account', async () => {
      const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '1',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Test notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      // First fetch notifications to populate the state
      nock('https://api.github.com')
        .get('/notifications?participating=false&all=false')
        .reply(200, mockNotifications);

      const stateWithSingleAccount = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithSingleAccount);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(1);

      // Now remove the account notifications
      act(() => {
        result.current.removeAccountNotifications(mockGitHubCloudAccount);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });
});
