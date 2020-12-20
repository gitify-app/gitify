import * as React from 'react';
import { Field } from 'react-final-form';

export interface IProps {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export class FieldInput extends React.PureComponent<IProps> {
  public static defaultProps = {
    type: 'text',
    placeholder: '',
    required: false,
  };

  render() {
    const { label, name, placeholder } = this.props;

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
              type="text"
              className="appearance-none block w-full bg-gray-100 border border-red rounded py-2 px-4 mb-2 focus:bg-gray-200 focus:outline-none"
              id={input.name}
              placeholder={placeholder}
              {...input}
            />

            {touched && error && (
              <div className="text-red-500 text-xs italic">{error}</div>
            )}
          </div>
        )}
      </Field>
    );
  }
}
