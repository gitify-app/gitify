import log from 'electron-log';
import type {
  AccountNotifications,
  GitifyState,
  SettingsState,
} from '../types';
import { Notification } from '../typesGitHub';
import { listBitbucketWork } from './api/bitbucket';
import { listNotificationsForAuthenticatedUser } from './api/client';
import { determineFailureType } from './api/errors';
import { getAccountUUID } from './auth/utils';
import { hideWindow, showWindow, updateTrayIcon } from './comms';
import { openNotification } from './links';
import { isWindows } from './platform';
import { getGitifySubjectDetails } from './subject';

export function setTrayIconColor(notifications: AccountNotifications[]) {
  const allNotificationsCount = getNotificationCount(notifications);

  updateTrayIcon(allNotificationsCount);
}

export function getNotificationCount(notifications: AccountNotifications[]) {
  return notifications.reduce(
    (memo, acc) => memo + acc.notifications.length,
    0,
  );
}

export const triggerNativeNotifications = (
  previousNotifications: AccountNotifications[],
  newNotifications: AccountNotifications[],
  state: GitifyState,
) => {
  const diffNotifications = newNotifications
    .map((accountNotifications) => {
      const accountPreviousNotifications = previousNotifications.find(
        (item) =>
          getAccountUUID(item.account) ===
          getAccountUUID(accountNotifications.account),
      );

      if (!accountPreviousNotifications) {
        return accountNotifications.notifications;
      }

      const accountPreviousNotificationsIds =
        accountPreviousNotifications.notifications.map((item) => item.id);

      const accountNewNotifications = accountNotifications.notifications.filter(
        (item) => {
          return !accountPreviousNotificationsIds.includes(`${item.id}`);
        },
      );

      return accountNewNotifications;
    })
    .reduce((acc, val) => acc.concat(val), []);

  setTrayIconColor(newNotifications);

  // If there are no new notifications just stop there
  if (!diffNotifications.length) {
    return;
  }

  if (state.settings.playSound) {
    raiseSoundNotification();
  }

  if (state.settings.showNotifications) {
    raiseNativeNotification(diffNotifications);
  }
};

export const raiseNativeNotification = (notifications: Notification[]) => {
  let title: string;
  let body: string;

  if (notifications.length === 1) {
    const notification = notifications[0];
    title = `${isWindows() ? '' : 'Gitify - '}${
      notification.repository.full_name
    }`;
    body = notification.subject.title;
  } else {
    title = 'Gitify';
    body = `You have ${notifications.length} notifications.`;
  }

  const nativeNotification = new Notification(title, {
    body,
    silent: true,
  });

  nativeNotification.onclick = () => {
    if (notifications.length === 1) {
      hideWindow();
      openNotification(notifications[0]);
    } else {
      showWindow();
    }
  };

  return nativeNotification;
};

export const raiseSoundNotification = () => {
  const audio = new Audio('../../assets/sounds/clearly.mp3');
  audio.volume = 0.2;
  audio.play();
};

function getNotifications(state: GitifyState) {
  return state.auth.accounts.map((account) => {
    return {
      account,
      notifications:
        account.platform === 'Bitbucket Cloud'
          ? listBitbucketWork(account)
          : listNotificationsForAuthenticatedUser(account, state.settings),
    };
  });
}

export async function getAllNotifications(
  state: GitifyState,
): Promise<AccountNotifications[]> {
  const responses = await Promise.all([...getNotifications(state)]);

  const notifications: AccountNotifications[] = await Promise.all(
    responses
      .filter((response) => !!response)
      .map(async (accountNotifications) => {
        try {
          // TODO - this needs to be correctly implemented
          if (accountNotifications.account.platform === 'Bitbucket Cloud') {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const res = (await accountNotifications.notifications).data as any;

            // TODO - when using IP allowlists, Bitbucket doesn't return any response indicator

            const pulls = res.pullRequests?.reviewing;

            // console.log(JSON.stringify(pulls));
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const notifications = pulls?.map((pull: any) => ({
              id: `${pull.destination.repository.full_name}-${pull.id}`,
              reason: 'review_requested',
              updated_at: pull.updated_on,
              url: pull.links.html.href,
              repository: {
                full_name: pull.destination.repository.full_name,
                owner: {
                  avatar_url: pull.destination.repository.links.avatar.href,
                },
                html_url: pull.destination.repository.links.html.href,
              },
              subject: {
                number: pull.id,
                title: pull.title,
                url: pull.links.html.href,
                type: 'PullRequest',
                state: 'open',
                user: {
                  login: pull.author.display_name,
                  html_url: pull.author.links.html.href,
                  avatar_url: pull.author.links.avatar.href,
                  type: 'User',
                },
                comments: pull.comment_count,
                tasks: pull.task_count,
              },
              account: accountNotifications.account,
            }));

            return {
              account: accountNotifications.account,
              notifications: notifications,
              error: null,
            };
          } else {
            let notifications = (
              await accountNotifications.notifications
            ).data.map((notification: Notification) => ({
              ...notification,
              account: accountNotifications.account,
            }));

            notifications = await enrichNotifications(notifications, state);

            notifications = filterNotifications(notifications, state.settings);

            return {
              account: accountNotifications.account,
              notifications: notifications,
              error: null,
            };
          }
        } catch (error) {
          log.error(
            'Error occurred while fetching account notifications',
            error,
          );
          return {
            account: accountNotifications.account,
            notifications: [],
            error: determineFailureType(error),
          };
        }
      }),
  );

  return notifications;
}

export async function enrichNotifications(
  notifications: Notification[],
  state: GitifyState,
): Promise<Notification[]> {
  if (!state.settings.detailedNotifications) {
    return notifications;
  }

  const enrichedNotifications = await Promise.all(
    notifications.map(async (notification: Notification) => {
      const additionalSubjectDetails =
        await getGitifySubjectDetails(notification);

      return {
        ...notification,
        subject: {
          ...notification.subject,
          ...additionalSubjectDetails,
        },
      };
    }),
  );

  return enrichedNotifications;
}

export function filterNotifications(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  return notifications.filter((notification) => {
    if (settings.hideBots && notification.subject?.user?.type === 'Bot') {
      return false;
    }

    if (
      settings.filterReasons.length > 0 &&
      !settings.filterReasons.includes(notification.reason)
    ) {
      return false;
    }

    return true;
  });
}
