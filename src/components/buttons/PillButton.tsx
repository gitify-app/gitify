import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { IconColor } from '../../types';
import { cn } from '../../utils/cn';

export interface IPillButton {
  key?: string;
  title: string;
  metric?: number;
  icon: Icon;
  color: IconColor;
}

export const PillButton: FC<IPillButton> = (props: IPillButton) => {
  return (
    <span title={props.title}>
      <button
        type="button"
        className="m-0.5 rounded-full bg-gray-100 px-1 text-xss hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <props.icon
          size={12}
          className={cn('mr-1', props.color)}
          aria-label={props.title}
        />
        {props.metric}
      </button>
    </span>
  );
};
