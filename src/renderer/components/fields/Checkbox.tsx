import type { FC, ReactNode } from 'react';

import { CounterLabel, Stack } from '@primer/react';

import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export interface ICheckbox {
  name: string;
  label: string;
  counter?: number;
  tooltip?: ReactNode | string;
  checked: boolean;
  disabled?: boolean;
  visible?: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: FC<ICheckbox> = ({
  visible = true,
  ...props
}: ICheckbox) => {
  const counter = props.counter > 0 ? props.counter : undefined;

  return (
    visible && (
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

        {counter && (
          <CounterLabel scheme={props.checked ? 'primary' : 'secondary'}>
            {counter}
          </CounterLabel>
        )}
      </Stack>
    )
  );
};
