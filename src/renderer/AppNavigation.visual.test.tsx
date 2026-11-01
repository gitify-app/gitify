import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cdp } from 'vite-plus/test/browser';

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

function routeAnimations() {
  return routeContent()
    .getAnimations()
    .filter((animation) => (animation as CSSAnimation).animationName === 'gitify-route-in');
}

async function waitForRouteAnimation() {
  await waitFor(() => expect(routeAnimations().length).toBeGreaterThan(0));
}

async function setReducedMotion(value: 'reduce' | 'no-preference') {
  const session = cdp() as unknown as {
    send: (method: string, params: unknown) => Promise<unknown>;
  };
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });
}

afterEach(async () => {
  await setReducedMotion('no-preference');
});

describe('renderer/App route transitions', () => {
  it('animates the routed content and leaves the destination interactive', async () => {
    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    expect(routeAnimations().length).toBeGreaterThan(0);
    expect(routeContent()).not.toContainElement(screen.getByRole('button', { name: 'Gitify' }));

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
    await waitForRouteAnimation();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
  });

  it('swaps the route without animation when reduced motion is active', async () => {
    await setReducedMotion('reduce');
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);

    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(routeAnimations()).toHaveLength(0);
  });

  it('applies a runtime reduced-motion change to the next route change', async () => {
    await setReducedMotion('no-preference');

    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    await waitForRouteAnimation();
    await Promise.all(routeAnimations().map((animation) => animation.finished));

    await setReducedMotion('reduce');

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(routeAnimations()).toHaveLength(0);
  });
});
