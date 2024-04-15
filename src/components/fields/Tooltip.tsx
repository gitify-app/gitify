import { QuestionIcon } from '@primer/octicons-react';
import { type FC, type ReactNode, useState } from 'react';

export interface ITooltip {
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      aria-label="tooltip"
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <QuestionIcon className="text-blue-500 ml-1" />
      {showTooltip && (
        <div className="absolute bg-white dark:bg-gray-sidebar border border-gray-300 rounded p-2 shadow">
          <div className="text-gray-700 dark:text-white text-xs text-left">
            {props.tooltip}
          </div>
        </div>
      )}
    </span>
  );
};
