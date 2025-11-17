import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { Size } from '../../types';
import { LogoIcon } from './LogoIcon';

describe('renderer/components/icons/LogoIcon.tsx', () => {
  it('renders correctly (light)', () => {
    const tree = renderWithAppContext(<LogoIcon size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly (dark)', () => {
    const tree = renderWithAppContext(<LogoIcon isDark size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('should click on the logo', async () => {
    const onClickMock = jest.fn();
    renderWithAppContext(<LogoIcon onClick={onClickMock} size={Size.SMALL} />);

    await userEvent.click(screen.getByLabelText('Gitify Logo'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should render small size', () => {
    const tree = renderWithAppContext(<LogoIcon size={Size.SMALL} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render medium size', () => {
    const tree = renderWithAppContext(<LogoIcon size={Size.MEDIUM} />);

    expect(tree).toMatchSnapshot();
  });

  it('should render large size', () => {
    const tree = renderWithAppContext(<LogoIcon size={Size.LARGE} />);

    expect(tree).toMatchSnapshot();
  });
});
