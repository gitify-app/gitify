export interface FieldLabelProps {
  name: string;
  label: string;
}

export function FieldLabel(props: FieldLabelProps) {
  return (
    <label className={'mr-1 font-medium cursor-pointer'} htmlFor={props.name}>
      {props.label}
    </label>
  );
}
