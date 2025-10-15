import type { FC } from 'react';

export interface IFieldLabel {
  name: string;
  label: string;
}

export const FieldLabel: FC<IFieldLabel> = (props: IFieldLabel) => {
  return (
    <label className={'mr-1 font-medium cursor-pointer'} htmlFor={props.name}>
      {props.label}
    </label>
  );
};
