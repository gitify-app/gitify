import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { openExternalLink } from '../../utils/comms';

export interface IButton {
  name: string;
  label: string;
  class?: string;
  icon?: Icon;
  size?: number;
  url?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: FC<IButton> = (props: IButton) => {
  const baseClass =
    'rounded bg-gray-300 font-semibold text-xs text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none cursor-pointer px-2 ';
  return (
    <button
      type={props.type ?? 'button'}
      title={props.label}
      aria-label={props.label}
      className={`${props.class} ${baseClass}`}
      disabled={props.disabled}
      onClick={() => {
        if (props.url) {
          return openExternalLink(props.url);
        }
        props.onClick();
      }}
    >
      {props.icon && <props.icon className="mr-1" size={props.size && 14} />}
      {props.name}
    </button>
  );
};
