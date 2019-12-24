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
          <div
            className={
              touched && error ? 'form-group has-danger' : 'form-group'
            }
          >
            <label htmlFor={input.name}>{label}</label>
            <div>
              <input
                type="text"
                className="form-control"
                id={input.name}
                {...input}
                placeholder={placeholder}
              />

              {touched && error && (
                <div className="form-control-feedback">{error}</div>
              )}
            </div>
          </div>
        )}
      </Field>
    );
  }
}
