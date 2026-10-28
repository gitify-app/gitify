import { useNavigate } from 'react-router-dom';

import { ArrowLeftIcon, type Icon } from '@primer/octicons-react';
import { IconButton, Stack } from '@primer/react';

import { useNotificationActions } from '../../hooks/notifications/useNotificationActions';

import { SectionHeading } from './SectionHeading';

interface HeaderProps {
  icon: Icon;
  children: string;
  fetchOnBack?: boolean;
}

export function Header(props: Readonly<HeaderProps>) {
  const navigate = useNavigate();

  const { refetchNotifications: fetchNotifications } = useNotificationActions();

  return (
    <div className="pl-4 pr-5 pt-3 pb-1">
      <Stack direction="horizontal" justify="space-between">
        <IconButton
          aria-label="Go back"
          icon={ArrowLeftIcon}
          onClick={() => {
            void navigate(-1);
            if (props.fetchOnBack) {
              void fetchNotifications();
            }
          }}
          tooltipDirection="e"
          variant="invisible"
        />

        <SectionHeading icon={props.icon}>{props.children}</SectionHeading>
      </Stack>
    </div>
  );
}
