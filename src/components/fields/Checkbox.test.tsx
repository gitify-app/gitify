import { render } from '@testing-library/react';
import { Checkbox, type ICheckbox } from './Checkbox';

describe('components/fields/Checkbox.tsx', () => {
  const props: ICheckbox = {
    name: 'appearance',
    label: 'Appearance',
    helpText: 'This is some helper text',
    checked: true,
    onChange: jest.fn(),
  };

  it('should render', () => {
    const tree = render(<Checkbox {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
