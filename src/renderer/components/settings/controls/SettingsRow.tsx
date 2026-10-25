import { type ReactNode, useId, useRef } from 'react';

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
  const controlsRef = useRef<HTMLDivElement>(null);

  if (!visible) {
    return null;
  }

  return (
    <fieldset
      aria-describedby={caption ? captionId : undefined}
      aria-labelledby={labelId}
      className={cn('m-0 min-w-0 border-0 p-0', disabled && 'opacity-60')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <button
            aria-hidden="true"
            className="cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] font-medium text-gitify-font"
            disabled={disabled}
            id={labelId}
            onClick={() => {
              controlsRef.current
                ?.querySelector<HTMLElement>('button, input, select, textarea')
                ?.focus();
            }}
            tabIndex={-1}
            type="button"
          >
            {label}
          </button>
          {tooltip && <Tooltip name={`tooltip-${name}`} tooltip={tooltip} />}
        </div>
        <div className="shrink-0" ref={controlsRef}>
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
    </fieldset>
  );
}
