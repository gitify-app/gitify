import type { ChangeEvent, FC, ReactNode } from 'react';
import type { RadioGroupItem } from '../../types';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export interface IRadioGroup {
  name: string;
  label: string;
  helpText?: ReactNode | string;
  tooltip?: ReactNode | string;
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
            className="font-medium text-gray-700 dark:text-gray-200"
            style={
              props.disabled ? { textDecoration: 'line-through' } : undefined
            }
          >
            {props.label}
            {props.tooltip && (
              <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />
            )}
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
                  className="size-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  id={`${props.name}_${item.value.toLowerCase()}`}
                  name={props.name}
                  value={item.value}
                  onChange={props.onChange}
                  checked={item.value === props.value}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.name}_${item.value.toLowerCase()}`}
                  className="ml-3 block text-sm font-medium text-gray-700 dark:text-white cursor-pointer"
                >
                  {item.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {props.helpText && (
        <div className="mt-1 text-xs italic text-gray-500 dark:text-gray-300">
          {props.helpText}
        </div>
      )}
    </div>
  );
};
