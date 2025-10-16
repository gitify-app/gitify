import { type FC, type ReactNode, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';
import { AnchoredOverlay } from '@primer/react';

export interface ITooltip {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <AnchoredOverlay
      align="center"
      open={showTooltip}
      renderAnchor={(anchorProps) => (
        <button
          {...anchorProps}
          aria-label={props.name}
          data-testid={`tooltip-${props.name}`}
          id={props.name}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          type="button"
        >
          <QuestionIcon className="text-gitify-tooltip-icon" />
        </button>
      )}
      side="outside-bottom"
    >
      <div
        className={
          'z-10 w-30 rounded-sm border border-gray-300 p-2 shadow-sm bg-gitify-tooltip-popout text-left text-xs text-gitify-font'
        }
      >
        {props.tooltip}
      </div>
    </AnchoredOverlay>
  );
};
