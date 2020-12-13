import * as React from 'react';

interface IFieldCheckbox {
  name: string;
  label: string;
  checked: boolean;
  onChange: any;
}

export const FieldCheckbox = (props: IFieldCheckbox) => {
  return (
    <div className="mt-1 mb-2">
      <label className="inline-flex items-center mt-2">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={props.checked}
          onChange={props.onChange}
        />

        <span className="ml-4 text-gray-700 dark:text-white">
          {props.label}
        </span>
      </label>
    </div>
  );
};
