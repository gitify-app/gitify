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
          className="form-checkbox h-5 w-5 text-red-600"
          checked={props.checked}
          onChange={props.onChange}
        />

        <span className="ml-2 text-gray-700">{props.label}</span>
      </label>
    </div>
  );
};
