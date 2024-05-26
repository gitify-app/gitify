import { fireEvent, render, screen } from '@testing-library/react';

import { Logo } from './Logo';

describe('components/Logo.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = render(<Logo />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly(dark)', () => {
    const tree = render(<Logo isDark />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', () => {
    const onClick = jest.fn();
    render(<Logo onClick={onClick} />);

    fireEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
