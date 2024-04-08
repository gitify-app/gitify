import type { ChangeEvent } from 'react';
import type { RadioGroupItem } from '../../types';

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
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) => {
  return (
    <div className='flex items-start mt-1 mb-3'>
      <div className='mr-3 text-sm py-1'>
        <label
          htmlFor={name}
          className='font-medium text-gray-700 dark:text-gray-200 '
        >
          {label}
        </label>

        {placeholder && (
          <div className='italic text-gray-500 dark:text-gray-300'>
            {placeholder}
          </div>
        )}
      </div>

      <div
        className='flex items-center space-x-4'
        role='group'
        aria-labelledby={name}
      >
        {options.map((item) => {
          return (
            <div
              className='flex mt-1'
              key={`radio_item_${item.value.toLowerCase()}`}
            >
              <input
                type='radio'
                className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300'
                id={`${name}_${item.value.toLowerCase()}`}
                name={name}
                value={item.value}
                onChange={onChange}
                checked={item.value === value}
              />
              <label
                htmlFor={`${name}_${item.value.toLowerCase()}`}
                className='ml-3 block text-sm font-medium text-gray-700 dark:text-white'
              >
                {item.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
