import { QuestionIcon } from '@primer/octicons-react';
import { Box } from '@primer/react';
import { type FC, type ReactNode, useState } from 'react';

export interface ITooltip {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<ITooltip> = (props: ITooltip) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box
      id={props.name}
      aria-label={props.name}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={`tooltip-${props.name}`}
    >
      <QuestionIcon className="text-gitify-tooltip-icon" />
      {showTooltip && (
        <Box className="absolute left-[-80px] z-10 w-60 rounded-sm border border-gray-300 p-2 shadow-sm bg-gitify-tooltip-popout">
          <Box className="text-left text-xs text-gitify-font">
            {props.tooltip}
          </Box>
        </Box>
      )}
    </Box>
  );
};
