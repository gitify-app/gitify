import { type FC, type ReactNode, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';

export interface ITooltip {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);
  // Use CSS/Tailwind to center the tooltip and constrain its width to the
  // viewport so it doesn't overflow the application window.

  return (
    <button
      aria-label={props.name}
      className="relative"
      data-testid={`tooltip-${props.name}`}
      id={props.name}
      onBlur={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      type="button"
    >
      <QuestionIcon className="text-gitify-tooltip-icon" />
      {showTooltip && (
        <div
          className={
            'absolute left-1/2 top-full mt-2 z-10 w-[240px] max-w-[calc(100vw-16px)] -translate-x-1/2 rounded-sm border border-gray-300 p-2 shadow-sm bg-gitify-tooltip-popout'
          }
        >
          <div className="text-left text-xs text-gitify-font">
            {props.tooltip}
          </div>
        </div>
      )}
    </button>
  );
};
