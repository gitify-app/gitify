import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Checkbox, type CheckboxProps } from './Checkbox';

describe('renderer/components/fields/Checkbox.tsx', () => {
  const props: CheckboxProps = {
    name: 'appearance',
    label: 'Appearance',
    checked: true,
    onChange: jest.fn(),
  };

  it('should render - visible', () => {
    const tree = renderWithAppContext(<Checkbox {...props} />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - not visible', () => {
    const tree = renderWithAppContext(<Checkbox visible={false} {...props} />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - disabled', () => {
    const tree = renderWithAppContext(<Checkbox disabled={true} {...props} />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - tooltip', () => {
    const tree = renderWithAppContext(
      <Checkbox {...props} tooltip={<div>Hello world</div>} />,
    );
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - positive counter unselected', () => {
    const tree = renderWithAppContext(
      <Checkbox {...props} checked={false} counter={5} />,
    );
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - positive counter selected', () => {
    const tree = renderWithAppContext(
      <Checkbox {...props} checked={true} counter={5} />,
    );
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - zero counter', () => {
    const tree = renderWithAppContext(<Checkbox {...props} counter={0} />);
    expect(tree.container).toMatchSnapshot();
  });
});
