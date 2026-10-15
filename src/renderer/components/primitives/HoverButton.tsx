import type { Icon } from '@primer/octicons-react';
import { IconButton } from '@primer/react';

import type { VariantType } from '../../types';

interface HoverButtonProps {
  label: string;
  icon: Icon;
  enabled?: boolean;
  testid: string;
  action: () => void;
  variant?: VariantType;
}

export function HoverButton({ enabled = true, variant = 'invisible', ...props }: HoverButtonProps) {
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
        variant={variant}
      />
    )
  );
}
