import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';

import { Header } from './Header';

describe('renderer/components/primitives/Header.tsx', () => {
  const fetchNotificationsMock = vi.fn();

  it('renders itself & its children', () => {
    const tree = renderWithProviders(<Header icon={MarkGithubIcon}>Test Header</Header>);

    expect(tree.container).toMatchSnapshot();
  });

  it('navigates back', async () => {
    renderWithProviders(<Header icon={MarkGithubIcon}>Test Header</Header>);

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates back and fetch notifications', async () => {
    renderWithProviders(
      <Header fetchOnBack icon={MarkGithubIcon}>
        Test Header
      </Header>,
      { fetchNotifications: fetchNotificationsMock },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
