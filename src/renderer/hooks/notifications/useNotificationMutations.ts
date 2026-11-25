import { useCallback } from 'react';

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getNotificationFailureKey,
  type NotificationFailedActionType,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../../stores';

import type { AccountNotifications, GitifyNotification } from '../../types';

import {
  isMarkAsDoneFeatureSupported,
  isUnsubscribeThreadSupported,
} from '../../utils/api/features';
import { notificationsKeys } from '../../utils/api/queryKeys';
import { rendererLogError, toError } from '../../utils/core/logger';
import { getAccountAdapter } from '../../utils/forges/registry';
import {
  type FailedNotificationAction,
  type NotificationQuerySnapshot,
  restoreFailedNotifications,
  settleNotificationActions,
} from '../../utils/notifications/mutations';
import { removeNotificationsForAccount } from '../../utils/notifications/remove';

export interface MarkNotificationsAsReadOptions {
  /** Update the cache before the request resolves. Used by OS actions. */
  optimistic?: boolean;
}

export interface NotificationMutations {
  markNotificationsAsRead: (
    notifications: GitifyNotification[],
    options?: MarkNotificationsAsReadOptions,
  ) => Promise<boolean>;
  markNotificationsAsDone: (notifications: GitifyNotification[]) => Promise<boolean>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<boolean>;
}

/**
 * The write side of notification state: mark-as-read, mark-as-done, and
 * unsubscribe, each reconciling per-notification failures against the query
 * cache and the session-local failure map.
 *
 * Takes the caller's `notificationsQueryKey` so cache updates target the same
 * key the reader observes. Side effects live in the host hook, not here.
 */
export const useNotificationMutations = (
  notificationsQueryKey: QueryKey,
): NotificationMutations => {
  const queryClient = useQueryClient();

  const markAsDoneOnUnsubscribe = useSettingsStore((s) => s.markAsDoneOnUnsubscribe);

  // Shared by all three mutations' `onSuccess`. Records each failure's
  // classified error in the session-local failure map and logs it; also
  // re-applies `snapshot` for any failed notification missing from the
  // cache, as a defensive guard (these mutations don't remove notifications
  // until they succeed, so this is normally a no-op).
  const reconcileFailedNotifications = useCallback(
    (
      failed: FailedNotificationAction[],
      snapshot: NotificationQuerySnapshot | undefined,
      action: NotificationFailedActionType,
      context: string,
    ) => {
      if (failed.length === 0) {
        return;
      }

      const failedNotifications = failed.map((f) => f.notification);

      if (snapshot) {
        for (const [queryKey, snapshotData] of snapshot) {
          queryClient.setQueryData<AccountNotifications[]>(queryKey, (existing) =>
            restoreFailedNotifications(failedNotifications, snapshotData ?? [], existing ?? []),
          );
        }
      }

      for (const { notification, error, rawError } of failed) {
        const notificationKey = getNotificationFailureKey(notification.account, notification.id);
        useNotificationActionFailuresStore
          .getState()
          .setFailure(notificationKey, { action, error });
        rendererLogError(
          context,
          `Error occurred while processing notification ${notification.id}`,
          rawError,
        );
      }
    },
    [queryClient],
  );

  // Full-cache restore for `onError`, covering the rare case where a
  // mutation function throws directly (e.g. a bug) rather than resolving via
  // `settleNotificationActions`. Per-notification failures are handled by
  // `reconcileFailedNotifications` above instead.
  const restoreSnapshot = useCallback(
    (snapshot?: NotificationQuerySnapshot) => {
      if (!snapshot) {
        return;
      }

      for (const [queryKey, data] of snapshot) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    [queryClient],
  );

  const snapshotNotifications = useCallback(async () => {
    // Prevent an older in-flight poll from overwriting the mutation's eventual cache update.
    await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

    const snapshot = queryClient.getQueriesData<AccountNotifications[]>({
      queryKey: notificationsKeys.all,
    });

    return { snapshot };
  }, [queryClient]);

  const createMutationErrorHandler = useCallback(
    (logContext: string, message: string) =>
      (err: Error, _variables: unknown, context?: { snapshot: NotificationQuerySnapshot }) => {
        restoreSnapshot(context?.snapshot);
        rendererLogError(logContext, message, toError(err));
      },
    [restoreSnapshot],
  );

  const markNotificationsAsReadMutation = useMutation({
    mutationFn: async ({
      readNotifications,
    }: {
      readNotifications: GitifyNotification[];
      optimistic?: boolean;
    }) => {
      return await settleNotificationActions(readNotifications, (notification) =>
        getAccountAdapter(notification.account).markThreadAsRead(notification.id),
      );
    },

    onMutate: async ({
      readNotifications,
      optimistic,
    }: {
      readNotifications: GitifyNotification[];
      optimistic?: boolean;
    }) => {
      const context = await snapshotNotifications();

      if (optimistic && readNotifications.length > 0) {
        queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
          removeNotificationsForAccount(
            readNotifications[0].account,
            readNotifications,
            existing ?? [],
          ),
        );
      }

      return context;
    },

    onSuccess: ({ succeeded, failed }, _variables, context) => {
      // Cache removal happens here (once the request resolves) rather than
      // optimistically in `onMutate`, so the row's exit animation - started
      // synchronously on click - has time to play before the notification
      // disappears from the list.
      if (succeeded.length > 0) {
        queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
          removeNotificationsForAccount(succeeded[0].account, succeeded, existing ?? []),
        );
      }

      useNotificationActionFailuresStore
        .getState()
        .clearFailures(
          succeeded.map((notification) =>
            getNotificationFailureKey(notification.account, notification.id),
          ),
        );

      reconcileFailedNotifications(
        failed,
        context?.snapshot,
        'markAsRead',
        'markNotificationsAsRead',
      );
    },

    onError: createMutationErrorHandler(
      'markNotificationsAsRead',
      'Error occurred while marking notifications as read',
    ),
  });

  const markNotificationsAsDoneMutation = useMutation({
    mutationFn: async ({ doneNotifications }: { doneNotifications: GitifyNotification[] }) => {
      const account = doneNotifications[0].account;

      // Forges that don't support a distinct "done" state fall back to
      // marking as read so the user-visible action still removes the thread.
      if (!isMarkAsDoneFeatureSupported(account)) {
        return await markNotificationsAsReadMutation.mutateAsync({
          readNotifications: doneNotifications,
        });
      }

      return await settleNotificationActions(doneNotifications, (notification) =>
        getAccountAdapter(notification.account).markThreadAsDone(notification.id),
      );
    },

    onMutate: snapshotNotifications,

    onSuccess: ({ succeeded, failed }, { doneNotifications }, context) => {
      // The mark-as-read fallback (for forges without a distinct "done"
      // state) already updated the cache via its own mutation/onSuccess.
      if (succeeded.length > 0 && isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        queryClient.setQueryData<AccountNotifications[]>(notificationsQueryKey, (existing) =>
          removeNotificationsForAccount(succeeded[0].account, succeeded, existing ?? []),
        );
      }

      useNotificationActionFailuresStore
        .getState()
        .clearFailures(
          succeeded.map((notification) =>
            getNotificationFailureKey(notification.account, notification.id),
          ),
        );

      if (isMarkAsDoneFeatureSupported(doneNotifications[0].account)) {
        reconcileFailedNotifications(
          failed,
          context?.snapshot,
          'markAsDone',
          'markNotificationsAsDone',
        );
      }
    },

    onError: createMutationErrorHandler(
      'markNotificationsAsDone',
      'Error occurred while marking notifications as done',
    ),
  });

  const unsubscribeNotificationMutation = useMutation({
    mutationFn: async ({ notification }: { notification: GitifyNotification }) => {
      // Forges without thread-subscription support cannot unsubscribe; the UI
      // already hides the action, but treat duplicate calls as no-ops.
      if (!isUnsubscribeThreadSupported(notification.account)) {
        return { succeeded: [notification], failed: [] };
      }

      const result = await settleNotificationActions([notification], (n) =>
        getAccountAdapter(n.account).unsubscribeThread(n.id),
      );

      if (result.failed.length > 0) {
        return result;
      }

      const followUp = markAsDoneOnUnsubscribe
        ? await markNotificationsAsDoneMutation.mutateAsync({
            doneNotifications: [notification],
          })
        : await markNotificationsAsReadMutation.mutateAsync({
            readNotifications: [notification],
          });

      return followUp.failed.length > 0 ? followUp : result;
    },

    onMutate: snapshotNotifications,

    onSuccess: ({ succeeded, failed }, _variables, context) => {
      useNotificationActionFailuresStore
        .getState()
        .clearFailures(
          succeeded.map((notification) =>
            getNotificationFailureKey(notification.account, notification.id),
          ),
        );

      reconcileFailedNotifications(
        failed,
        context?.snapshot,
        'unsubscribe',
        'unsubscribeNotification',
      );
    },

    onError: createMutationErrorHandler(
      'unsubscribeNotification',
      'Error occurred while unsubscribing from notification thread',
    ),
  });

  const markNotificationsAsRead = useCallback(
    async (readNotifications: GitifyNotification[], options?: MarkNotificationsAsReadOptions) => {
      try {
        const { failed } = await markNotificationsAsReadMutation.mutateAsync({
          readNotifications,
          optimistic: options?.optimistic,
        });
        return failed.length === 0;
      } catch {
        return false;
      }
    },
    [markNotificationsAsReadMutation],
  );

  const markNotificationsAsDone = useCallback(
    async (doneNotifications: GitifyNotification[]) => {
      try {
        const { failed } = await markNotificationsAsDoneMutation.mutateAsync({
          doneNotifications,
        });
        return failed.length === 0;
      } catch {
        return false;
      }
    },
    [markNotificationsAsDoneMutation],
  );

  const unsubscribeNotification = useCallback(
    async (notification: GitifyNotification) => {
      try {
        const { failed } = await unsubscribeNotificationMutation.mutateAsync({ notification });
        return failed.length === 0;
      } catch {
        return false;
      }
    },
    [unsubscribeNotificationMutation],
  );

  return {
    markNotificationsAsRead,
    markNotificationsAsDone,
    unsubscribeNotification,
  };
};
