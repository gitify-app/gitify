import type { FC } from 'react';

export interface FieldLabelProps {
  name: string;
  label: string;
}

export const FieldLabel: FC<FieldLabelProps> = (props: FieldLabelProps) => {
  return (
    <label className={'mr-1 font-medium cursor-pointer'} htmlFor={props.name}>
      {props.label}
    </label>
  );
};
