import * as React from 'react';
import { Field } from 'react-final-form';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.25;
  color: #55595c;
  background-color: #fff;
  background-image: none;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  outline: none;
  box-sizing: border-box;
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  font-size: 90%;
  color: ${(props) => props.theme.danger};
`;

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
          <Wrapper>
            <Label htmlFor={input.name}>{label}</Label>
            <Input
              type="text"
              id={input.name}
              {...input}
              placeholder={placeholder}
            />

            {touched && error && <ErrorMessage>{error}</ErrorMessage>}
          </Wrapper>
        )}
      </Field>
    );
  }
}
