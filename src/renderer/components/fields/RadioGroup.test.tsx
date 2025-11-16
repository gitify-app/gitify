import { renderWithAppContext } from '../../__helpers__/test-utils';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';

describe('renderer/components/fields/RadioGroup.tsx', () => {
  const props: RadioGroupProps = {
    label: 'Appearance',
    name: 'appearance',
    options: [
      { label: 'Value 1', value: 'one' },
      { label: 'Value 2', value: 'two' },
    ],
    onChange: jest.fn(),
    value: 'two',
  };

  it('should render', () => {
    const tree = renderWithAppContext(<RadioGroup {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render as disabled', () => {
    const mockProps = { ...props, disabled: true };

    const tree = renderWithAppContext(<RadioGroup {...mockProps} />);
    expect(tree).toMatchSnapshot();
  });
});
