import type { ChangeEvent, ReactNode } from 'react';

import { Stack } from '@primer/react';

import type { RadioGroupItem } from '../../types';

import { FieldLabel } from './FieldLabel';
import { Tooltip } from './Tooltip';

export interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioGroupItem[];
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  tooltip?: ReactNode | string;
}

export function RadioGroup(props: Readonly<RadioGroupProps>) {
  const firstOptionId = props.options[0]
    ? `radio-${props.name}-${props.options[0].value.toLowerCase()}`
    : props.name;

  return (
    <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
      <FieldLabel label={props.label} name={firstOptionId} />

      {props.options.map((item) => {
        const name = `radio-${props.name}-${item.value.toLowerCase()}`;

        return (
          <Stack align="center" direction="horizontal" gap="condensed" key={name}>
            <input
              checked={item.value === props.value}
              className="size-4 cursor-pointer"
              data-testid={name}
              id={name}
              name={props.name}
              onChange={props.onChange}
              type="radio"
              value={item.value}
            />
            <FieldLabel label={item.label} name={name} />
          </Stack>
        );
      })}

      {props.tooltip && <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />}
    </Stack>
  );
}
