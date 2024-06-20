import {
  BellSlashIcon,
  CheckIcon,
  FeedPersonIcon,
  MarkGithubIcon,
  ReadIcon,
} from '@primer/octicons-react';
import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AppContext } from '../context/App';
import { IconColor, Opacity, Size } from '../types';
import type { Notification } from '../typesGitHub';
import { cn } from '../utils/cn';
import {
  formatForDisplay,
  formatNotificationUpdatedAt,
} from '../utils/helpers';
import {
  getNotificationTypeIcon,
  getNotificationTypeIconColor,
} from '../utils/icons';
import {
  openNotification,
  openRepository,
  openUserProfile,
} from '../utils/links';
import { formatReason } from '../utils/reason';
import { HoverGroup } from './HoverGroup';
import { InteractionButton } from './buttons/InteractionButton';
import { AvatarIcon } from './icons/AvatarIcon';
import { Pills } from './notification/Pills';

interface INotificationRow {
  notification: Notification;
}

export const NotificationRow: FC<INotificationRow> = ({
  notification,
}: INotificationRow) => {
  const {
    settings,
    removeNotificationFromState,
    markNotificationRead,
    markNotificationDone,
    unsubscribeNotification,
  } = useContext(AppContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [showAsRead, setShowAsRead] = useState(false);

  const handleNotification = useCallback(() => {
    setAnimateExit(!settings.delayNotificationState);
    setShowAsRead(settings.delayNotificationState);

    openNotification(notification);

    if (settings.markAsDoneOnOpen) {
      markNotificationDone(notification);
    } else {
      // no need to mark as read, github does it by default when opening it
      removeNotificationFromState(settings, notification);
    }
  }, [
    notification,
    markNotificationDone,
    removeNotificationFromState,
    settings,
  ]);
  const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    unsubscribeNotification(notification);
  };

  const reason = formatReason(notification.reason);
  const NotificationIcon = getNotificationTypeIcon(notification.subject);
  const iconColor = getNotificationTypeIconColor(notification.subject);

  const updatedAt = formatNotificationUpdatedAt(notification);
  const updatedLabel = notification.subject.user
    ? `${notification.subject.user.login} updated ${updatedAt}`
    : `Updated ${updatedAt}`;

  const notificationTitle = formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);

  const repoAvatarUrl = notification.repository.owner.avatar_url;
  const repoSlug = notification.repository.full_name;

  const groupByDate = settings.groupBy === 'DATE';

  return (
    <div
      id={notification.id}
      className={cn(
        'group flex border-b border-gray-100 bg-white px-3 py-2 hover:bg-gray-100 dark:border-gray-darker dark:bg-gray-dark dark:text-white dark:hover:bg-gray-darker',
        animateExit &&
          'translate-x-full opacity-0 transition duration-[350ms] ease-in-out',
        showAsRead && Opacity.READ,
      )}
    >
      <div
        className={cn('mr-3 flex w-5 items-center justify-center', iconColor)}
        title={notificationTitle}
      >
        <NotificationIcon
          size={groupByDate ? Size.XLARGE : Size.MEDIUM}
          aria-label={notification.subject.type}
        />
      </div>

      <div
        className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap cursor-pointer"
        onClick={() => handleNotification()}
      >
        {groupByDate && (
          <div
            className={cn(
              'mb-1 flex items-center gap-1 text-xs font-medium',
              Opacity.MEDIUM,
            )}
            title={repoSlug}
          >
            <span>
              <AvatarIcon
                title={repoSlug}
                url={repoAvatarUrl}
                size={Size.SMALL}
                defaultIcon={MarkGithubIcon}
              />
            </span>
            <span
              title={repoSlug}
              className="cursor-pointer truncate opacity-90"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openRepository(notification.repository);
              }}
            >
              {repoSlug}
            </span>
          </div>
        )}

        <div
          className="mb-1 truncate text-sm"
          role="main"
          title={notification.subject.title}
        >
          {notification.subject.title}
        </div>

        <div
          className={cn(
            'flex flex-wrap items-center gap-1 text-xs capitalize',
            Opacity.MEDIUM,
          )}
        >
          {notification.subject.user ? (
            <button
              type="button"
              title="View User Profile"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openUserProfile(notification.subject.user);
              }}
              className="flex-shrink-0"
            >
              <AvatarIcon
                title={notification.subject.user.login}
                url={notification.subject.user.avatar_url}
                size={Size.XSMALL}
                defaultIcon={FeedPersonIcon}
              />
            </button>
          ) : (
            <div>
              <FeedPersonIcon size={Size.MEDIUM} className={IconColor.GRAY} />
            </div>
          )}
          <div title={reason.description}>{reason.title}</div>
          <div title={updatedLabel}>{updatedAt}</div>
          <Pills notification={notification} />
        </div>
      </div>

      <HoverGroup>
        <InteractionButton
          title="Mark as Done"
          icon={CheckIcon}
          size={Size.MEDIUM}
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationDone(notification);
          }}
        />
        <InteractionButton
          title="Mark as Read"
          icon={ReadIcon}
          size={Size.SMALL}
          onClick={() => {
            setAnimateExit(!settings.delayNotificationState);
            setShowAsRead(settings.delayNotificationState);
            markNotificationRead(notification);
          }}
        />
        <InteractionButton
          title="Unsubscribe from Thread"
          icon={BellSlashIcon}
          size={Size.SMALL}
          onClick={unsubscribeFromThread}
        />
      </HoverGroup>
    </div>
  );
};
