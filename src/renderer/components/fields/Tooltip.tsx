import { type FC, type ReactNode, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';

export interface ITooltip {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      aria-label={props.name}
      className="relative"
      data-testid={`tooltip-${props.name}`}
      id={props.name}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      type="button"
    >
      <QuestionIcon className="text-gitify-tooltip-icon" />
      {showTooltip && (
        <div className="absolute left-[-80px] z-10 w-60 rounded-sm border border-gray-300 p-2 shadow-sm bg-gitify-tooltip-popout">
          <div className="text-left text-xs text-gitify-font">
            {props.tooltip}
          </div>
        </div>
      )}
    </button>
  );
};
