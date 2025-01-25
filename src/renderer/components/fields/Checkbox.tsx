import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export interface ICheckbox {
  name: string;
  label: string;
  tooltip?: ReactNode | string;
  checked: boolean;
  disabled?: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: FC<ICheckbox> = (props: ICheckbox) => {
  return (
    <Stack
      direction="horizontal"
      gap="condensed"
      align="center"
      className="text-sm"
    >
      <input
        type="checkbox"
        id={props.name}
        className="size-4 rounded-sm cursor-pointer"
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
        data-testid={`checkbox-${props.name}`}
      />

      <label
        htmlFor={props.name}
        className={cn(
          'font-medium text-gitify-font cursor-pointer',
          props.disabled && 'line-through',
        )}
      >
        {props.label}
      </label>
      {props.tooltip && (
        <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />
      )}
    </Stack>
  );
};
