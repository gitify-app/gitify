import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { describe, expect, it, vi } from 'vitest';

import { Size } from '../../types';
import { LogoIcon } from './LogoIcon';

describe('renderer/components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = render(<LogoIcon size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly (dark)', () => {
    const tree = render(<LogoIcon isDark size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', async () => {
    const onClick = vi.fn();
    render(<LogoIcon onClick={onClick} size={Size.SMALL} />);

    await userEvent.click(screen.getByLabelText('Gitify Logo'));

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
