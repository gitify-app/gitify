import { type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeftIcon, type Icon } from '@primer/octicons-react';
import { Box, IconButton, Stack } from '@primer/react';

import { AppContext } from '../../context/App';
import { Title } from './Title';

interface IHeader {
  icon: Icon;
  children: string;
  fetchOnBack?: boolean;
}

export const Header: FC<IHeader> = (props: IHeader) => {
  const navigate = useNavigate();

  const { fetchNotifications } = useContext(AppContext);

  return (
    <Box className="pl-4 pr-6 pt-3 pb-1">
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
    </Box>
  );
};
