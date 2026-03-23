import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import {
  navigateMock,
  renderWithAppContext,
} from '../../__helpers__/test-utils';

import { Header } from './Header';

describe('renderer/components/primitives/Header.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  it('should render itself & its children', () => {
    const tree = renderWithAppContext(
      <Header icon={MarkGithubIcon}>Test Header</Header>,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should navigate back', async () => {
    renderWithAppContext(<Header icon={MarkGithubIcon}>Test Header</Header>);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('should navigate back and fetch notifications', async () => {
    renderWithAppContext(
      <Header fetchOnBack icon={MarkGithubIcon}>
        Test Header
      </Header>,
      { fetchNotifications: fetchNotificationsMock },
    );

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
