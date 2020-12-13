import * as React from 'react';
import { RadioGroupItem } from '../../../types';

export const FieldRadioGroup = ({
  label,
  placeholder,
  name,
  options,
  onChange,
  value,
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: RadioGroupItem[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) => {
  return (
    <fieldset id={name}>
      <div>
        <legend className="mb-1 text-base font-medium dark:text-white">
          {label}
        </legend>
        {placeholder && <p className="text-sm text-gray-500">{placeholder}</p>}
      </div>

      <div
        className="flex items-center space-x-4 py-2"
        role="group"
        aria-labelledby={name}
      >
        {options.map((item) => {
          return (
            <div
              className="flex items-center mt-1"
              key={`radio_item_${item.value.toLowerCase()}`}
            >
              <input
                type="radio"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                id={`${name}_${item.value.toLowerCase()}`}
                name={name}
                value={item.value}
                onChange={onChange}
                checked={item.value === value}
              />
              <label
                htmlFor={`${name}_${item.value.toLowerCase}`}
                className="ml-3 block text-sm font-medium text-gray-700 dark:text-white"
              >
                {item.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
