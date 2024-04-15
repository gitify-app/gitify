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
    <div className="mt-1 mb-3 text-sm">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={props.name}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            checked={props.checked}
            onChange={props.onChange}
            disabled={props.disabled}
          />
        </div>

        <div className="ml-3 ">
          <label
            htmlFor={props.name}
            className="font-medium text-gray-700 dark:text-gray-200"
            style={
              props.disabled ? { textDecoration: 'line-through' } : undefined
            }
          >
            {props.label}
            {props.tooltip && <Tooltip tooltip={props.tooltip} />}
          </label>
        </div>
      </div>

      {props.helpText && (
        <div className="text-xs mt-1 italic text-gray-500 dark:text-gray-300">
          {props.helpText}
        </div>
      )}
    </div>
  );
};
