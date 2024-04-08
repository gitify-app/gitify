import type { FC, ReactNode } from 'react';
import { Field } from 'react-final-form';

export interface IProps {
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  helpText?: ReactNode | string;
  required?: boolean;
}

export const FieldInput: FC<IProps> = ({
  label,
  name,
  placeholder = '',
  helpText,
  type = 'text',
  required = false,
}) => {
  return (
    <Field name={name}>
      {({ input, meta: { touched, error } }) => (
        <div className="mt-2">
          <label
            className="block tracking-wide text-grey-dark text-sm font-semibold mb-2"
            htmlFor={input.name}
          >
            {label}
          </label>

          <input
            type={type}
            className="appearance-none block w-full dark:text-gray-800 bg-gray-100 border border-red rounded py-1.5 px-4 mb-2 focus:bg-gray-200 focus:outline-none"
            id={input.name}
            placeholder={placeholder}
            required={required}
            {...input}
          />

          {helpText && (
            <div className="mt-3 text-gray-700 dark:text-gray-200 text-xs">
              {helpText}
            </div>
          )}

          {touched && error && (
            <div className="mt-2 text-red-500 text-xs italic">{error}</div>
          )}
        </div>
      )}
    </Field>
  );
};
