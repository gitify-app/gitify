import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { openExternalLink } from '../../utils/comms';

export interface IButton {
  name: string;
  label: string;
  icon?: Icon;
  url?: string;
  size?: number;
  class?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: FC<IButton> = (props: IButton) => {
  const baseClass =
    'rounded bg-gray-300 font-semibold rounded text-sm text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none cursor-pointer';
  return (
    <button
      type={props.type ?? 'button'}
      title={props.label}
      aria-label={props.label}
      className={`${props.class} ${baseClass}`}
      disabled={props.disabled}
      onClick={() => props.url && openExternalLink(props.url)}
    >
      {props.icon && <props.icon className="mr-1" size={props.size && 14} />}
      {props.name}
    </button>
  );
};
