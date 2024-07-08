import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';

interface ILegend {
  icon: Icon;
  children: string;
}

export const Legend: FC<ILegend> = (props) => {
  return (
    <legend
      id={props.children.toLowerCase().replace(' ', '-')}
      className="mb-1 mt-2 font-semibold flex items-center"
    >
      <props.icon className="mr-2" />
      {props.children}
    </legend>
  );
};
