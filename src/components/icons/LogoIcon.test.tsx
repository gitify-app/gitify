import { fireEvent, render, screen } from '@testing-library/react';
import { Size } from '../../types';
import { LogoIcon } from './LogoIcon';

describe('components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = render(<LogoIcon size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly (dark)', () => {
    const tree = render(<LogoIcon isDark size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    render(<LogoIcon onClick={onClick} size={Size.SMALL} />);

    fireEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render small size', () => {
    const tree = render(<LogoIcon size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render medium size', () => {
    const tree = render(<LogoIcon size={Size.MEDIUM} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render large size', () => {
    const tree = render(<LogoIcon size={Size.LARGE} />);

    expect(tree).toMatchSnapshot();
  });
});
