import { type ReactNode, useId } from 'react';

import { SegmentedControl, Select } from '@primer/react';

import { Tooltip } from '../../fields/Tooltip';

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
  const captionId = `${name}-${id}-caption`;
  const selectId = `${name}-${id}-select`;

  if (!visible) {
    return null;
  }

  const labelContent =
    presentation === 'select' ? (
      <label className="font-medium" htmlFor={selectId} id={labelId}>
        {label}
      </label>
    ) : (
      <span className="font-medium" id={labelId}>
        {label}
      </span>
    );

  const control =
    presentation === 'select' ? (
      <Select
        aria-describedby={caption ? captionId : undefined}
        data-testid={`select-${name}`}
        disabled={disabled}
        id={selectId}
        onChange={(event) => onChange(event.target.value)}
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
          {labelContent}
          {tooltip && <Tooltip name={`tooltip-${name}`} tooltip={tooltip} />}
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
