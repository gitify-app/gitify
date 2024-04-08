interface IFieldCheckbox {
  name: string;
  label: string;
  checked: boolean;
  onChange: any;
  placeholder?: string;
  disabled?: boolean;
}

export const FieldCheckbox = (props: IFieldCheckbox) => {
  return (
    <div className='flex items-start mt-1 mb-3'>
      <div className='flex items-center h-5'>
        <input
          type='checkbox'
          id={props.name}
          className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
          checked={props.checked}
          onChange={props.onChange}
          disabled={props.disabled}
        />
      </div>

      <div className='ml-3 text-sm'>
        <label
          htmlFor={props.name}
          className='font-medium text-gray-700 dark:text-gray-200'
          style={
            props.disabled ? { textDecoration: 'line-through' } : undefined
          }
        >
          {props.label}
        </label>
        {props.placeholder && (
          <div className='italic text-gray-500 dark:text-gray-300'>
            {props.placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
