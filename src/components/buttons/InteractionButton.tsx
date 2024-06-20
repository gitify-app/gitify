import type { Icon } from '@primer/octicons-react';
import type { FC, MouseEvent } from 'react';

export interface IInteractionButton {
  title: string;
  icon: Icon;
  size: 'small' | 'medium';
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
      <props.icon
        size={props.size === 'small' ? 14 : 16}
        aria-label={props.title}
      />
    </button>
  );
};
