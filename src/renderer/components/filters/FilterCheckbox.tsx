import type { ReactNode } from 'react';

import { Checkbox, CounterLabel } from '@primer/react';

import { cn } from 'cn';

import { HelpPopover } from '../primitives/HelpPopover';

export interface FilterCheckboxProps {
  name: string;
  label: string;
  checked: boolean;
  counter?: number;
  disabled?: boolean;
  tooltip?: ReactNode;
  onChange: () => void;
}

export function FilterCheckbox({
  name,
  label,
  checked,
  counter,
  disabled = false,
  tooltip,
  onChange,
}: Readonly<FilterCheckboxProps>) {
  const id = `filter-${name}`;

  return (
    <div className={cn('flex items-center gap-2 text-sm', disabled && 'opacity-60')}>
      <Checkbox
        checked={checked}
        data-testid={`checkbox-${name}`}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
      />

      <label
        className={cn('font-medium text-gitify-font cursor-pointer', disabled && 'line-through')}
        htmlFor={id}
      >
        {label}
      </label>

      {tooltip && <HelpPopover content={tooltip} label={label} name={`tooltip-${name}`} />}

      {counter !== undefined && (
        <CounterLabel
          className="text-gitify-counter-text"
          variant={checked ? 'primary' : 'secondary'}
        >
          {counter}
        </CounterLabel>
      )}
    </div>
  );
}
