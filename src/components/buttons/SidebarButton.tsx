import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { IconColor, Size } from '../../types';
import { cn } from '../../utils/cn';

export interface ISidebarButton {
  title: string;
  metric?: number;
  icon: Icon;
  route?: string;
  onClick?: () => void;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
}

export const SidebarButton: FC<ISidebarButton> = (props: ISidebarButton) => {
  const location = useLocation();

  const hasMetric = props?.metric > 0;

  const isRoute = location.pathname.startsWith(props.route);

  return (
    <button
      type="button"
      className={cn(
        'flex justify-evenly items-center w-full my-1 cursor-pointer text-xs font-extrabold focus:outline-none disabled:text-gray-500  disabled:cursor-default',
        hasMetric
          ? `${IconColor.GREEN} hover:text-green-700`
          : `${IconColor.WHITE} hover:text-gray-500`,
        isRoute && 'rounded-md ring-1 ring-current',
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
