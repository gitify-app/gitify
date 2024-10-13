import type { FC, MouseEvent } from 'react';

import type { Icon } from '@primer/octicons-react';
import { IconButton } from '@primer/react';

import type { Size } from '../../types';

export interface IInteractionButton {
  title: string;
  icon: Icon;
  size: Size;
  onClick: (event?: MouseEvent<HTMLElement>) => void;
}

export const InteractionButton: FC<IInteractionButton> = (
  props: IInteractionButton,
) => {
  return (
    <IconButton
      aria-label={props.title}
      size="small"
      variant="invisible"
      icon={props.icon}
      onClick={props.onClick}
    />
  );
};
