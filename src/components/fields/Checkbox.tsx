import type { FC, ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export interface ICheckbox {
  name: string;
  label: string;
  helpText?: ReactNode | string;
  tooltip?: ReactNode | string;
  checked: boolean;
  disabled?: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: FC<ICheckbox> = (props: ICheckbox) => {
  return (
    <div className="mb-3 mt-1 text-sm">
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            id={props.name}
            className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={props.checked}
            onChange={props.onChange}
            disabled={props.disabled}
          />
        </div>

        <div className="ml-3">
          <label
            htmlFor={props.name}
            className="font-medium text-gray-700 dark:text-gray-200"
            style={
              props.disabled ? { textDecoration: 'line-through' } : undefined
            }
          >
            {props.label}
            {props.tooltip && (
              <Tooltip name={`tooltip-${props.name}`} tooltip={props.tooltip} />
            )}
          </label>
        </div>
      </div>

      {props.helpText && (
        <div className="mt-1 text-xs italic text-gray-500 dark:text-gray-300">
          {props.helpText}
        </div>
      )}
    </div>
  );
};
