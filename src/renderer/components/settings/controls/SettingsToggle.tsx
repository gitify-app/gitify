import { type ReactNode, useId } from 'react';

import { ToggleSwitch } from '@primer/react';

import { cn } from 'cn';

import { Tooltip } from '../../fields/Tooltip';

export interface SettingsToggleProps {
  name: string;
  label: string;
  caption?: ReactNode;
  tooltip?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  visible?: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingsToggle({
  name,
  label,
  caption,
  tooltip,
  checked,
  disabled = false,
  visible = true,
  onChange,
}: Readonly<SettingsToggleProps>) {
  const id = useId();
  const labelId = `${name}-${id}-label`;
  const captionId = `${name}-${id}-caption`;

  if (!visible) {
    return null;
  }

  return (
    <div className={cn('flex items-start justify-between gap-3', disabled && 'opacity-60')}>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <button
            aria-hidden="true"
            className="cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] font-medium text-gitify-font"
            disabled={disabled}
            id={labelId}
            onClick={() => onChange(!checked)}
            tabIndex={-1}
            type="button"
          >
            {label}
          </button>
          {tooltip && <Tooltip name={`tooltip-${name}`} tooltip={tooltip} />}
        </div>

        {caption && (
          <div className="text-sm text-gitify-icon-muted" id={captionId}>
            {caption}
          </div>
        )}
      </div>

      <ToggleSwitch
        aria-describedby={caption ? captionId : undefined}
        aria-labelledby={labelId}
        checked={checked}
        disabled={disabled}
        data-testid={`switch-${name}`}
        onChange={onChange}
        size="small"
      />
    </div>
  );
}
