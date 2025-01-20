import { type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeftIcon, type Icon } from '@primer/octicons-react';
import { Heading, IconButton, Stack } from '@primer/react';

import { AppContext } from '../../context/App';
import { Size } from '../../types';

interface IHeader {
  icon: Icon;
  children: string;
  fetchOnBack?: boolean;
}

export const Header: FC<IHeader> = (props: IHeader) => {
  const navigate = useNavigate();

  const { fetchNotifications } = useContext(AppContext);

  return (
    <div className="mx-6 mt-2 py-2">
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

        <Stack direction="horizontal" align="center" gap="condensed">
          <props.icon size={Size.LARGE} />
          <Heading sx={{ fontSize: 3 }}>{props.children}</Heading>
        </Stack>
      </Stack>
    </div>
  );
};
