import type { ChangeEvent, FC } from 'react';

import { Stack } from '@primer/react';

import type { RadioGroupItem } from '../../types';
import { FieldLabel } from './FieldLabel';

export interface IRadioGroup {
  name: string;
  label: string;
  options: RadioGroupItem[];
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroup: FC<IRadioGroup> = (props: IRadioGroup) => {
  return (
    <Stack
      direction="horizontal"
      gap="condensed"
      align="center"
      className="text-sm"
    >
      <FieldLabel name={props.name} label={props.label} />

      {props.options.map((item) => {
        const name = `radio-${props.name}-${item.value}`.toLowerCase();

        return (
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            key={name}
          >
            <input
              type="radio"
              className="size-4 cursor-pointer"
              id={name}
              name={props.name}
              value={item.value}
              onChange={props.onChange}
              checked={item.value === props.value}
              data-testid={name}
            />
            <FieldLabel name={name} label={item.label} />
          </Stack>
        );
      })}
    </Stack>
  );
};
