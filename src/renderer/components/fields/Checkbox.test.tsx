import { render } from '@testing-library/react';

import { Checkbox, type ICheckbox } from './Checkbox';

describe('renderer/components/fields/Checkbox.tsx', () => {
  const props: ICheckbox = {
    name: 'appearance',
    label: 'Appearance',
    checked: true,
    onChange: jest.fn(),
  };

  it('should render - visible', () => {
    const tree = render(<Checkbox {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - not visible', () => {
    const tree = render(<Checkbox visible={false} {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - disabled', () => {
    const tree = render(<Checkbox disabled={true} {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - tooltip', () => {
    const tree = render(
      <Checkbox {...props} tooltip={<div>Hello world</div>} />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render - positive counter unselected', () => {
    const tree = render(<Checkbox {...props} counter={5} checked={false} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - positive counter selected', () => {
    const tree = render(<Checkbox {...props} counter={5} checked={true} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - zero counter', () => {
    const tree = render(<Checkbox {...props} counter={0} />);
    expect(tree).toMatchSnapshot();
  });
});
