import * as React from 'react';
import * as TestRendener from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';

import { FieldRadioGroup } from './radiogroup';

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
    const tree = TestRendener.create(<FieldRadioGroup {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should check that NProgress is getting called in getDerivedStateFromProps (loading)', function () {
    const { getByLabelText } = render(<FieldRadioGroup {...props} />);
    fireEvent.click(getByLabelText('Value 1'));
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
