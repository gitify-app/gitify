import { render } from '@testing-library/react';
import { Checkbox, type ICheckbox } from './Checkbox';

describe('renderer/components/fields/Checkbox.tsx', () => {
  const props: ICheckbox = {
    name: 'appearance',
    label: 'Appearance',
    checked: true,
    onChange: jest.fn(),
  };

  it('should render', () => {
    const tree = render(<Checkbox {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
