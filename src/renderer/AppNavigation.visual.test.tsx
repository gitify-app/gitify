import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockGitHubCloudAccount } from './__mocks__/account-mocks';
import { mockSettings } from './__mocks__/state-mocks';

import { useAccountsStore, useSettingsStore } from './stores';

import { App } from './App';

vi.mock('./hooks/useAccounts', () => ({
  useAccounts: vi.fn(),
}));

vi.mock('./hooks/notifications/useNotificationsHost', async () => {
  const { getMockedNotificationsState } = await import('./__helpers__/hook-mocks');
  return {
    useNotificationsHost: () => getMockedNotificationsState(),
  };
});

function renderAtRoot() {
  useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
  useSettingsStore.setState(mockSettings);
  window.history.replaceState(null, '', '#/');

  return render(<App />);
}

function routeContent() {
  return screen.getByTestId('route-content');
}

describe('renderer/App route changes', () => {
  it('keeps sidebar controls above the routed content', async () => {
    renderAtRoot();

    const settings = screen.getByRole('button', { name: 'Settings' });
    const rect = settings.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

    expect(settings.contains(hit)).toBe(true);

    await userEvent.click(settings);
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('swaps routes immediately and leaves the destination interactive', async () => {
    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    expect(routeContent().getAnimations()).toHaveLength(0);
    expect(routeContent()).not.toContainElement(screen.getByRole('button', { name: 'Gitify' }));

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
    expect(routeContent().getAnimations()).toHaveLength(0);
  });
});
