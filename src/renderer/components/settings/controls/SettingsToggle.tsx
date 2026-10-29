import { type ReactNode, useId } from 'react';

import { ToggleSwitch } from '@primer/react';

import { cn } from 'cn';

import { HelpPopover } from '../../primitives/HelpPopover';

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
  const visibleLabelId = `${name}-${id}-visible-label`;
  const captionId = `${name}-${id}-caption`;

  if (!visible) {
    return null;
  }

  return (
    <div className={cn('flex items-start justify-between gap-3', disabled && 'opacity-60')}>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="sr-only" id={labelId}>
            {label}
          </span>
          {/* Primer's unlayered `button { font: inherit }` outranks Tailwind's
              utilities, so the label typography is marked important to match
              the other row labels. */}
          <button
            aria-hidden="true"
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm! font-[inherit] font-medium! text-gitify-font"
            disabled={disabled}
            id={visibleLabelId}
            onClick={() => onChange(!checked)}
            tabIndex={-1}
            type="button"
          >
            {label}
          </button>
          {tooltip && <HelpPopover content={tooltip} label={label} name={`tooltip-${name}`} />}
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
