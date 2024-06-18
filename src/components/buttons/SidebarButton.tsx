import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { IconColor } from '../../types';
import { cn } from '../../utils/cn';

export interface ISidebarButton {
  title: string;
  metric?: number;
  icon: Icon;
  onClick?: () => void;
}

export const SidebarButton: FC<ISidebarButton> = (props: ISidebarButton) => {
  const hasMetric = props?.metric > 0;

  return (
    <button
      type="button"
      className={cn(
        'my-1 flex cursor-pointer items-center justify-around self-stretch px-2 py-1 text-xs font-extrabold',
        hasMetric ? IconColor.GREEN : IconColor.WHITE,
      )}
      onClick={() => props.onClick()}
      title={props.title}
    >
      <props.icon size={12} aria-label={props.title} />
      {hasMetric && props.metric}
    </button>
  );
};
