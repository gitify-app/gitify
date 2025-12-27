import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { IconButton } from '@primer/react';

interface HoverButtonProps {
  label: string;
  icon: Icon;
  enabled?: boolean;
  testid: string;
  action: () => void;
}

export const HoverButton: FC<HoverButtonProps> = ({
  enabled = true,
  ...props
}: HoverButtonProps) => {
  return (
    enabled && (
      <IconButton
        aria-label={props.label}
        data-testid={props.testid}
        icon={props.icon}
        onClick={(event) => {
          event.stopPropagation();
          props.action();
        }}
        size="small"
        title={props.label}
        unsafeDisableTooltip={true}
        variant="invisible"
      />
    )
  );
};
