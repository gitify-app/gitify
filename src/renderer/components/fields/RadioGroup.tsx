import type { ChangeEvent, FC } from 'react';
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
    <div className="flex items-start my-2 text-sm font-medium">
      <FieldLabel name={props.name} label={props.label} />

      <div
        className="flex items-center space-x-4"
        role="group"
        aria-labelledby={props.name}
      >
        {props.options.map((item) => {
          const name = `radio-${props.name}-${item.value}`.toLowerCase();

          return (
            <div className="flex items-center gap-2" key={name}>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
