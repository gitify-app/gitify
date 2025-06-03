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
    <Box className="px-3 py-2">
      <Stack direction="horizontal" justify="space-between">
        <IconButton
          aria-labelledby="Go Back"
          variant="invisible"
          tooltipDirection="e"
          icon={ArrowLeftIcon}
          onClick={() => {
            navigate(-1);
            if (props.fetchOnBack) {
              fetchNotifications();
            }
          }}
          data-testid="header-nav-back"
        />

        <Title icon={props.icon} size={3}>
          {props.children}
        </Title>
      </Stack>
    </Box>
  );
};
