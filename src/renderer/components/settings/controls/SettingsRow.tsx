import { type ReactNode, useId } from 'react';

import { cn } from 'cn';

import { Tooltip } from '../../fields/Tooltip';

export interface SettingsRowProps {
  name: string;
  label: string;
  caption?: ReactNode;
  tooltip?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  disabledReason?: ReactNode;
  visible?: boolean;
}

export function SettingsRow({
  name,
  label,
  caption,
  tooltip,
  children,
  disabled = false,
  disabledReason,
  visible = true,
}: Readonly<SettingsRowProps>) {
  const id = useId();
  const labelId = `${name}-${id}-label`;
  const captionId = `${name}-${id}-caption`;

  if (!visible) {
    return null;
  }

  return (
    <div className={cn(disabled && 'opacity-60')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <span className="font-medium" id={labelId}>
            {label}
          </span>
          {tooltip && <Tooltip name={`tooltip-${name}`} tooltip={tooltip} />}
        </div>
        <div
          aria-describedby={caption ? captionId : undefined}
          aria-labelledby={labelId}
          className="shrink-0"
          role="group"
        >
          {children}
        </div>
      </div>

      {caption && (
        <div className="text-sm text-gitify-icon-muted" id={captionId}>
          {caption}
        </div>
      )}

      {disabled && disabledReason && (
        <div className="pt-1 text-xs text-gitify-caution">{disabledReason}</div>
      )}
    </div>
  );
}
