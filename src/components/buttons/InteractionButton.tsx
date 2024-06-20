import type { Icon } from '@primer/octicons-react';
import type { FC, MouseEventHandler } from 'react';

export interface IInteractionButton {
  title: string;
  icon: Icon;
  size: 'small' | 'medium';
  onClick: () => MouseEventHandler;
}

export const InteractionButton: FC<IInteractionButton> = (
  props: IInteractionButton,
) => {
  return (
    <button
      type="button"
      className="h-full hover:text-green-500 focus:outline-none"
      title={props.title}
      onClick={props.onClick()}
    >
      <props.icon size={14} />
    </button>
  );
};
