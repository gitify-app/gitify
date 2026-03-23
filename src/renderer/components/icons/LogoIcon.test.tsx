import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { Size } from '../../types';

import { LogoIcon } from './LogoIcon';

describe('renderer/components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = renderWithProviders(<LogoIcon size={Size.SMALL} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders correctly (dark)', () => {
    const tree = renderWithProviders(<LogoIcon isDark size={Size.SMALL} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should click on the logo', async () => {
    const onClickMock = vi.fn();
    renderWithProviders(<LogoIcon onClick={onClickMock} size={Size.SMALL} />);

    await userEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should render small size', () => {
    const tree = renderWithProviders(<LogoIcon size={Size.SMALL} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render medium size', () => {
    const tree = renderWithProviders(<LogoIcon size={Size.MEDIUM} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render large size', () => {
    const tree = renderWithProviders(<LogoIcon size={Size.LARGE} />);

    expect(tree.container).toMatchSnapshot();
  });
});
