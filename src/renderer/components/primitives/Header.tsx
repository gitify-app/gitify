import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeftIcon, type Icon } from '@primer/octicons-react';
import { IconButton, Stack } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';
import { Title } from './Title';

interface HeaderProps {
  icon: Icon;
  children: string;
  fetchOnBack?: boolean;
}

export const Header: FC<HeaderProps> = (props: HeaderProps) => {
  const navigate = useNavigate();

  const { fetchNotifications } = useAppContext();

  return (
    <div className="pl-4 pr-5 pt-3 pb-1">
      <Stack direction="horizontal" justify="space-between">
        <IconButton
          aria-labelledby="Go Back"
          data-testid="header-nav-back"
          icon={ArrowLeftIcon}
          onClick={() => {
            navigate(-1);
            if (props.fetchOnBack) {
              fetchNotifications();
            }
          }}
          tooltipDirection="e"
          variant="invisible"
        />

        <Title icon={props.icon} size={3}>
          {props.children}
        </Title>
      </Stack>
    </div>
  );
};
