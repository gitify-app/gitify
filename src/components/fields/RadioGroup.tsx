import type { ChangeEvent, FC, ReactNode } from 'react';
import type { RadioGroupItem } from '../../types';

export interface IRadioGroup {
  name: string;
  label: string;
  helpText?: ReactNode | string;
  options: RadioGroupItem[];
  value: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroup: FC<IRadioGroup> = (props: IRadioGroup) => {
  return (
    <div className="mt-1 mb-3 text-sm">
      <div className="flex items-start">
        <div className="mr-3 py-1">
          <label
            htmlFor={props.name}
            className="font-medium text-gray-700 dark:text-gray-200 "
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
                className="flex mt-1"
                key={`radio_item_${item.value.toLowerCase()}`}
              >
                <input
                  type="radio"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  id={`${props.name}_${item.value.toLowerCase()}`}
                  name={props.name}
                  value={item.value}
                  onChange={props.onChange}
                  checked={item.value === props.value}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.name}_${item.value.toLowerCase()}`}
                  className="ml-3 block text-sm font-medium text-gray-700 dark:text-white"
                >
                  {item.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {props.helpText && (
        <div className="text-xs mt-1 italic text-gray-500 dark:text-gray-300">
          {props.helpText}
        </div>
      )}
    </div>
  );
};
