import type { FC } from 'react';

export interface IFieldLabel {
  name: string;
  label: string;
}

export const FieldLabel: FC<IFieldLabel> = (props: IFieldLabel) => {
  return (
    <label htmlFor={props.name} className="mr-3 font-medium cursor-pointer">
      {props.label}
    </label>
  );
};
