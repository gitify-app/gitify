import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { IconColor, Size } from '../../types';
import { cn } from '../../utils/cn';

export interface ISidebarButton {
  title: string;
  metric?: number;
  icon: Icon;
  onClick?: () => void;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
}

export const SidebarButton: FC<ISidebarButton> = (props: ISidebarButton) => {
  const hasMetric = props?.metric > 0;

  return (
    <button
      type="button"
      className={cn(
        'flex justify-evenly items-center w-full my-1 cursor-pointer text-xs font-extrabold focus:outline-none disabled:text-gray-500  disabled:cursor-default',
        hasMetric
          ? `${IconColor.GREEN} hover:text-green-700`
          : `${IconColor.WHITE} hover:text-gray-500`,
        props.loading ? 'animate-spin' : undefined,
        props.size ? 'py-2' : 'py-1',
      )}
      onClick={() => props.onClick()}
      title={props.title}
      disabled={props.disabled}
    >
      <props.icon size={props.size ?? Size.XSMALL} aria-label={props.title} />
      {hasMetric && props.metric}
    </button>
  );
};
