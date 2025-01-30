import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { IconButton } from '@primer/react';

interface IHoverButton {
  label: string;
  icon: Icon;
  enabled?: boolean;
  testid: string;
  action: () => void;
}

export const HoverButton: FC<IHoverButton> = ({
  enabled = true,
  ...props
}: IHoverButton) => {
  return (
    enabled && (
      <IconButton
        aria-label={props.label}
        unsafeDisableTooltip={true}
        title={props.label}
        icon={props.icon}
        size="small"
        variant="invisible"
        onClick={(event) => {
          event.stopPropagation();
          props.action();
        }}
        data-testid={props.testid}
      />
    )
  );
};
