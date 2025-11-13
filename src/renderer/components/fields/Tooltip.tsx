import { type FC, type ReactNode, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';
import { AnchoredOverlay } from '@primer/react';

import { cn } from '../../utils/cn';

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
        className={cn(
          'z-10 w-60 p-2',
          'text-left text-xs text-gitify-font',
          'rounded-sm border border-gray-300 shadow-sm bg-gitify-tooltip-popout',
        )}
      >
        {props.tooltip}
      </div>
    </AnchoredOverlay>
  );
};
