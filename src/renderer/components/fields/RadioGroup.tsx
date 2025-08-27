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
      align="center"
      className="text-sm"
      direction="horizontal"
      gap="condensed"
    >
      <FieldLabel label={props.label} name={props.name} />

      {props.options.map((item) => {
        const name = `radio-${props.name}-${item.value.toLowerCase()}`;

        return (
          <Stack
            align="center"
            direction="horizontal"
            gap="condensed"
            key={name}
          >
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
    </Stack>
  );
};
