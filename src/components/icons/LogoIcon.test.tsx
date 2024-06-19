import { fireEvent, render, screen } from '@testing-library/react';
import { LogoIcon } from './LogoIcon';

describe('components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = render(<LogoIcon />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly(dark)', () => {
    const tree = render(<LogoIcon isDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    render(<LogoIcon onClick={onClick} />);

    fireEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
