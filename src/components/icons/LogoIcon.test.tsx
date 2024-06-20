import { fireEvent, render, screen } from '@testing-library/react';
import { Size } from '../../types';
import { LogoIcon } from './LogoIcon';

describe('components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = render(<LogoIcon />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly (dark)', () => {
    const tree = render(<LogoIcon isDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    render(<LogoIcon onClick={onClick} size={Size.XSMALL} />);

    fireEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render a different size', () => {
    const tree = render(<LogoIcon size={Size.XLARGE} />);

    expect(tree).toMatchSnapshot();
  });
});
