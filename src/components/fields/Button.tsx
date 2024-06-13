import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { WebUrl } from '../../types';
import { cn } from '../../utils/cn';
import { openExternalLink } from '../../utils/comms';

export interface IButton {
  name: string;
  label: string;
  className?: string;
  icon?: Icon;
  size?: number;
  url?: WebUrl;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: FC<IButton> = (props: IButton) => {
  const baseClass =
    'rounded bg-gray-300 font-semibold text-xs text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none cursor-pointer px-2 py-1';
  return (
    <button
      type={props.type ?? 'button'}
      title={props.label}
      aria-label={props.label}
      className={cn(props.className, baseClass)}
      disabled={props.disabled}
      onClick={() => {
        if (props.url) {
          return openExternalLink(props.url);
        }

        if (props.onClick) {
          return props.onClick();
        }
      }}
    >
      {props.icon && <props.icon className="mr-1" size={props.size ?? 14} />}
      {props.name}
    </button>
  );
};
