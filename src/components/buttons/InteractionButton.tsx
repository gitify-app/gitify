import type { Icon } from '@primer/octicons-react';
import type { FC, MouseEvent } from 'react';
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
    <button
      type="button"
      className="h-full hover:text-green-500 focus:outline-none"
      title={props.title}
      onClick={props.onClick}
    >
      <props.icon size={props.size} aria-label={props.title} />
    </button>
  );
};
