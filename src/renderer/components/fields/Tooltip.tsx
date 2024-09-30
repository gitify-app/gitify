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
      <QuestionIcon className="ml-1 text-blue-500" />
      {showTooltip && (
        <div className="absolute z-10 w-60 rounded border border-gray-300 bg-white p-2 shadow dark:bg-gray-sidebar">
          <div className="text-left text-xs text-gray-700 dark:text-white">
            {props.tooltip}
          </div>
        </div>
      )}
    </span>
  );
};
