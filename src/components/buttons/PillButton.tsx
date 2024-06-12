import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { IconColor } from '../../types';

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
        className="rounded-full text-xss px-1 m-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <props.icon
          size={12}
          className={`mr-1 ${props.color}`}
          aria-label={props.title}
        />
        {props.metric}
      </button>
    </span>
  );
};
