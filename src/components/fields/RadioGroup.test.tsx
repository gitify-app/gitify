import { fireEvent, render, screen } from '@testing-library/react';

import * as TestRenderer from 'react-test-renderer';

import { FieldRadioGroup } from './RadioGroup';

describe('components/fields/radiogroup.tsx', () => {
  const props = {
    label: 'Appearance',
    name: 'appearance',
    placeholder: 'This is some helper text',
    options: [
      { label: 'Value 1', value: 'one' },
      { label: 'Value 2', value: 'two' },
    ],
    onChange: jest.fn(),
    value: 'two',
  };

  it('should render ', () => {
    const tree = TestRenderer.create(<FieldRadioGroup {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should check that NProgress is getting called in getDerivedStateFromProps (loading)', () => {
    render(<FieldRadioGroup {...props} />);
    fireEvent.click(screen.getByLabelText('Value 1'));
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
