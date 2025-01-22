import type { ChangeEvent, FC } from 'react';
import type { RadioGroupItem } from '../../types';
import { cn } from '../../utils/cn';

export interface IRadioGroup {
  name: string;
  label: string;
  options: RadioGroupItem[];
  value: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const RadioGroup: FC<IRadioGroup> = (props: IRadioGroup) => {
  return (
    <div className={cn('mt-3 mb-2 text-sm', props.className)}>
      <div className="flex items-start">
        <div className="mr-3">
          <label
            htmlFor={props.name}
            className="font-medium text-gitify-font"
            style={
              props.disabled ? { textDecoration: 'line-through' } : undefined
            }
          >
            {props.label}
          </label>
        </div>

        <div
          className="flex items-center space-x-4"
          role="group"
          aria-labelledby={props.name}
        >
          {props.options.map((item) => {
            return (
              <div
                className="flex items-center"
                key={`radio_item_${item.value.toLowerCase()}`}
              >
                <input
                  type="radio"
                  className="size-4 cursor-pointer"
                  id={`${props.name}_${item.value.toLowerCase()}`}
                  name={props.name}
                  value={item.value}
                  onChange={props.onChange}
                  checked={item.value === props.value}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.name}_${item.value.toLowerCase()}`}
                  className="ml-3 block text-sm font-medium text-gitify-font cursor-pointer"
                >
                  {item.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
