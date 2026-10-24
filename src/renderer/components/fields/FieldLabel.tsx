import type { ReactNode } from 'react';

import { cn } from 'cn';

import { Tooltip } from './Tooltip';

export interface FieldLabelProps {
  name: string;
  label: string;
  tooltip?: ReactNode | string;
}

export function FieldLabel(props: Readonly<FieldLabelProps>) {
  return (
    <>
      <label
        className={cn('font-medium cursor-pointer', !props.tooltip && 'mr-1')}
        htmlFor={props.name}
      >
        {props.label}
      </label>

      {props.tooltip && <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />}
    </>
  );
}
