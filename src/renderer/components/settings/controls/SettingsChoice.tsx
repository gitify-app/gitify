import { type ReactNode, useId, useRef } from 'react';

import { SegmentedControl, Select } from '@primer/react';

import { cn } from 'cn';

import { HelpPopover } from '../../primitives/HelpPopover';

export interface SettingsChoiceOption {
  label: string;
  value: string;
}

export interface SettingsChoiceProps {
  name: string;
  label: string;
  caption?: ReactNode;
  tooltip?: ReactNode;
  value: string;
  options?: SettingsChoiceOption[];
  presentation?: 'segmented' | 'select';
  selectChildren?: ReactNode;
  disabled?: boolean;
  visible?: boolean;
  onChange: (value: string) => void;
}

export function SettingsChoice({
  name,
  label,
  caption,
  tooltip,
  value,
  options = [],
  presentation = 'segmented',
  selectChildren,
  disabled = false,
  visible = true,
  onChange,
}: Readonly<SettingsChoiceProps>) {
  const id = useId();
  const labelId = `${name}-${id}-label`;
  const visibleLabelId = `${name}-${id}-visible-label`;
  const captionId = `${name}-${id}-caption`;
  const selectId = `${name}-${id}-select`;
  const selectRef = useRef<HTMLSelectElement>(null);

  if (!visible) {
    return null;
  }

  const focusControl = () => {
    if (presentation === 'select') {
      const select = selectRef.current;

      if (!select) {
        return;
      }

      select.focus();

      if (typeof select.showPicker === 'function') {
        try {
          select.showPicker();
        } catch {
          // Focus is the fallback when the browser cannot open the picker.
        }
      }

      return;
    }

    const currentIndex = options.findIndex((option) => option.value === value);
    const nextOption = options[(currentIndex + 1) % options.length];

    if (nextOption) {
      onChange(nextOption.value);
    }
  };

  const control =
    presentation === 'select' ? (
      <Select
        aria-describedby={caption ? captionId : undefined}
        aria-labelledby={labelId}
        data-testid={`select-${name}`}
        disabled={disabled}
        id={selectId}
        onChange={(event) => onChange(event.target.value)}
        ref={selectRef}
        value={value}
      >
        {selectChildren ??
          options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
      </Select>
    ) : (
      <SegmentedControl
        aria-describedby={caption ? captionId : undefined}
        aria-labelledby={labelId}
        onChange={(index) => {
          const option = options[index];
          if (option) {
            onChange(option.value);
          }
        }}
      >
        {options.map((option) => (
          <SegmentedControl.Button
            data-testid={`choice-${name}-${option.value.toLowerCase()}`}
            key={option.value}
            selected={option.value === value}
          >
            {option.label}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <span className="sr-only" id={labelId}>
            {label}
          </span>
          {/* Primer's unlayered `button { font: inherit }` outranks Tailwind's
              utilities, so the label typography is marked important to match
              the row labels. */}
          <button
            aria-hidden="true"
            className={cn(
              'cursor-pointer border-0 bg-transparent p-0 text-left text-sm! font-[inherit] font-medium! text-gitify-font',
              disabled && 'cursor-not-allowed opacity-60',
            )}
            disabled={disabled}
            id={visibleLabelId}
            onClick={focusControl}
            tabIndex={-1}
            type="button"
          >
            {label}
          </button>
          {tooltip && <HelpPopover content={tooltip} label={label} name={`tooltip-${name}`} />}
        </div>
        <div className="shrink-0">{control}</div>
      </div>

      {caption && (
        <div className="text-sm text-gitify-icon-muted" id={captionId}>
          {caption}
        </div>
      )}
    </div>
  );
}
