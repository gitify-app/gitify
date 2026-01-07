import { type FC, type ReactNode, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';
import { AnchoredOverlay } from '@primer/react';

import { cn } from '../../utils/cn';

export interface TooltipProps {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <AnchoredOverlay
      align="center"
      open={showTooltip}
      renderAnchor={(anchorProps) => (
        <button
          {...anchorProps}
          aria-label={props.name}
          data-testid={`tooltip-icon-${props.name}`}
          id={props.name}
          onClick={() => setShowTooltip(!showTooltip)}
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
        data-testid={`tooltip-content-${props.name}`}
        onMouseLeave={() => setShowTooltip(false)}
        role="tooltip"
      >
        {props.tooltip}
      </div>
    </AnchoredOverlay>
  );
};
