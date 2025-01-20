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
      <QuestionIcon className="ml-1 text-gitify-tooltip-icon" />
      {showTooltip && (
        <div className="absolute left-[-80px] z-10 w-60 rounded border border-gray-300 p-2 shadow bg-gitify-tooltip-popout">
          <div className="text-left text-xs text-gitify-font">
            {props.tooltip}
          </div>
        </div>
      )}
    </span>
  );
};
