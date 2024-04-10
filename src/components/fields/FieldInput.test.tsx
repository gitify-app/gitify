import * as TestRendener from 'react-test-renderer';

import { FieldInput, type IFieldInput } from './FieldInput';

describe('components/fields/FieldInput.tsx', () => {
  const props: IFieldInput = {
    name: 'appearance',
    label: 'Appearance',
    placeholder: 'This is some placeholder text',
    helpText: 'This is some helper text',
  };

  it('should render ', () => {
    const tree = TestRendener.create(<FieldInput {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
