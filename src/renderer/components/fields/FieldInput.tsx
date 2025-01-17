import type { FC, ReactNode } from 'react';
import { Field } from 'react-final-form';
import { cn } from '../../utils/cn';

export interface IFieldInput {
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  helpText?: ReactNode | string;
  required?: boolean;
}

export const FieldInput: FC<IFieldInput> = ({
  label,
  name,
  placeholder,
  helpText,
  type = 'text',
  required = false,
}) => {
  return (
    <Field name={name}>
      {({ input, meta: { touched, error } }) => (
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-semibold tracking-wide"
            htmlFor={input.name}
          >
            {label}
          </label>

          <input
            type={type}
            className={cn(
              'mb-2 block w-full appearance-none',
              'rounded border bg-gray-100 px-4 py-1.5 text-sm focus:bg-gray-200 focus:outline-none dark:text-gray-800',
              error ? 'border-red-500' : 'border-gray-500',
            )}
            id={input.name}
            placeholder={placeholder}
            required={required}
            {...input}
          />

          {helpText && (
            <div className="mt-3 text-xs text-gitify-font">{helpText}</div>
          )}

          {touched && error && (
            <div className="mt-2 text-xs italic text-gitify-error">{error}</div>
          )}
        </div>
      )}
    </Field>
  );
};
