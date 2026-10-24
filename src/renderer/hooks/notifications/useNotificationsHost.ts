import { buildNotificationsState, type NotificationsState } from '../useNotifications';
import { useNotificationActions } from './useNotificationActions';
import { useNotificationEffects } from './useNotificationEffects';
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
export interface NotificationsHostOptions {
  /**
   * Navigate to the notifications route when an OS notification click reveals
   * a notification in-app. Defaults to a no-op for consumers that only need the
   * host's data/actions (for example tests).
   */
  onReveal?: () => void;
}

export const useNotificationsHost = ({
  onReveal = () => undefined,
}: NotificationsHostOptions = {}): NotificationsState => {
  const query = useNotificationsQuery({ poll: true });
  const actions = useNotificationActions();

  useNotificationEffects({
    enabled: true,
    notifications: query.notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    notificationsQueryKey: query.notificationsQueryKey,
    refetch: query.refetch,
    fetchIntervalMs: query.fetchIntervalMs,
    actions,
    onReveal,
  });

  return buildNotificationsState(query, actions);
};
