import { fireEvent, render, screen } from '@testing-library/react';
import { type IRadioGroup, RadioGroup } from './RadioGroup';

describe('components/fields/RadioGroup.tsx', () => {
  const props: IRadioGroup = {
    label: 'Appearance',
    name: 'appearance',
    helpText: 'This is some helper text',
    options: [
      { label: 'Value 1', value: 'one' },
      { label: 'Value 2', value: 'two' },
    ],
    onChange: jest.fn(),
    value: 'two',
  };

  it('should render', () => {
    const tree = render(<RadioGroup {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render as disabled', () => {
    const mockProps = { ...props, disabled: true };

    const tree = render(<RadioGroup {...mockProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('should check that NProgress is getting called in getDerivedStateFromProps (loading)', () => {
    render(<RadioGroup {...props} />);
    fireEvent.click(screen.getByLabelText('Value 1'));
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
