import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

import { cn } from '../../utils/cn';
import { CustomCounter } from '../primitives/CustomCounter';
import { Tooltip } from './Tooltip';

export interface CheckboxProps {
  name: string;
  label: string;
  counter?: number;
  tooltip?: ReactNode | string;
  checked: boolean;
  disabled?: boolean;
  visible?: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: FC<CheckboxProps> = ({
  visible = true,
  ...props
}: CheckboxProps) => {
  const counter = props?.counter === 0 ? '0' : props.counter;

  return (
    visible && (
      <Stack
        align="center"
        className="text-sm"
        direction="horizontal"
        gap="condensed"
      >
        <input
          checked={props.checked}
          className="size-4 rounded-sm cursor-pointer"
          data-testid={`checkbox-${props.name}`}
          disabled={props.disabled}
          id={props.name}
          onChange={props.onChange}
          type="checkbox"
        />

        <label
          className={cn(
            'font-medium text-gitify-font cursor-pointer',
            props.disabled && 'line-through',
          )}
          htmlFor={props.name}
        >
          {props.label}
        </label>

        {props.tooltip && (
          <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />
        )}

        {counter && (
          <CustomCounter
            scheme={props.checked ? 'primary' : 'secondary'}
            value={counter}
          />
        )}
      </Stack>
    )
  );
};
