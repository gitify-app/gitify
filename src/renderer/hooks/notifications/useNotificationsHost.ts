import { buildNotificationsState, type NotificationsState } from '../useNotifications';
import { useNotificationEffects } from './useNotificationEffects';
import { useNotificationMutations } from './useNotificationMutations';
import { useNotificationsQuery } from './useNotificationsQuery';

/**
 * The single app-level notification host.
 *
 * Owns the polling observer and every notification side effect (sound and
 * native alerts, wake and focus refetch, and failure pruning). Mount it exactly
 * once, from `GlobalEffects`. Every other consumer uses the side-effect-free
 * `useNotifications` and shares the same query cache.
 *
 * @returns The same reader/actions surface as `useNotifications`.
 */
export const useNotificationsHost = (): NotificationsState => {
  const query = useNotificationsQuery({ poll: true });
  const mutations = useNotificationMutations(query.notificationsQueryKey);

  useNotificationEffects({
    enabled: true,
    notifications: query.notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    notificationsQueryKey: query.notificationsQueryKey,
    refetch: query.refetch,
    fetchIntervalMs: query.fetchIntervalMs,
  });

  return buildNotificationsState(query, mutations);
};
