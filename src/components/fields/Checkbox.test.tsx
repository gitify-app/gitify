import * as TestRenderer from 'react-test-renderer';

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
    const tree = TestRenderer.create(<Checkbox {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
