import { QuestionIcon } from '@primer/octicons-react';
import { type FC, type ReactNode, useState } from 'react';

export interface ITooltip {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      id={props.name}
      aria-label={props.name}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <QuestionIcon className="text-blue-500 ml-1" />
      {showTooltip && (
        <div className="absolute bg-white dark:bg-gray-sidebar border border-gray-300 rounded p-2 shadow z-10">
          <div className="text-gray-700 dark:text-white text-xs text-left">
            {props.tooltip}
          </div>
        </div>
      )}
    </span>
  );
};
