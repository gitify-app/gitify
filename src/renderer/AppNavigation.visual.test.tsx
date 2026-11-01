import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cdp } from 'vite-plus/test/browser';

import { getMockedNotificationsState, setNotificationsOverrides } from './__helpers__/hook-mocks';
import { mockGitHubCloudAccount } from './__mocks__/account-mocks';
import { mockGitifyNotification } from './__mocks__/notifications-mocks';
import { mockSettings } from './__mocks__/state-mocks';

import { useAccountsStore, useSettingsStore } from './stores';

import { type AccountNotifications, type GitifyNotification, GroupBy } from './types';

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

interface TransitionRecord {
  pseudoElements: Set<string>;
}

function getPseudoElement(animation: Animation): string | undefined {
  return (animation.effect as KeyframeEffect | null)?.pseudoElement ?? undefined;
}

function spyOnViewTransitions() {
  const original = document.startViewTransition.bind(document);
  const startViewTransition = vi.spyOn(document, 'startViewTransition');
  const records: TransitionRecord[] = [];

  startViewTransition.mockImplementation((update) => {
    const transition = original(update);
    void transition.ready
      .then(() => {
        const pseudoElements = new Set(
          document
            .getAnimations()
            .map(getPseudoElement)
            .filter(
              (pseudoElement): pseudoElement is string =>
                pseudoElement?.startsWith('::view-transition') ?? false,
            ),
        );
        records.push({ pseudoElements });
      })
      .catch(() => {
        // A skipped transition still leaves the route change complete.
      });
    return transition;
  });

  return { startViewTransition, records };
}

function hasAnimatedViewTransition() {
  return document.getAnimations().some((animation) => {
    if (!getPseudoElement(animation)?.startsWith('::view-transition')) {
      return false;
    }
    const duration = animation.effect?.getComputedTiming().duration;
    return typeof duration === 'number' && duration > 0;
  });
}

function viewTransitionAnimations() {
  return document
    .getAnimations()
    .filter((animation) => getPseudoElement(animation)?.startsWith('::view-transition'));
}

const notificationFixture = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    ...mockGitifyNotification,
    id: `notification-${index}`,
    order: index,
    subject: { ...mockGitifyNotification.subject, title: `Notification ${index}` },
  }));

function renderAtRoot(
  notifications: GitifyNotification[] = getMockedNotificationsState().notifications.flatMap(
    (entry) => entry.notifications,
  ),
) {
  const accountNotifications: AccountNotifications[] = [
    {
      account: mockGitHubCloudAccount,
      notifications,
      error: null,
    },
  ];

  useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
  useSettingsStore.setState({ ...mockSettings, groupBy: GroupBy.REPOSITORY });
  setNotificationsOverrides({
    notifications: accountNotifications,
    notificationCount: notifications.length,
    hasNotifications: notifications.length > 0,
  });
  window.history.replaceState(null, '', '#/');

  return render(<App />);
}

function scrollContainer() {
  const element = document.querySelector<HTMLElement>('.overflow-y-auto');
  if (!element) {
    throw new Error('Notification scroll container is missing');
  }
  return element;
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
  vi.restoreAllMocks();
  await setReducedMotion('no-preference');
});

describe('renderer/App route transitions', () => {
  it('transitions between the notification list and settings and leaves the destination interactive', async () => {
    const { startViewTransition, records } = spyOnViewTransitions();

    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    expect(startViewTransition).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    await waitFor(() => {
      expect(records.length).toBeGreaterThanOrEqual(2);
    });
    const pseudoElements = new Set(records.flatMap((record) => [...record.pseudoElements]));
    expect(pseudoElements).toContain('::view-transition-old(route)');
    expect(pseudoElements).toContain('::view-transition-new(route)');
  });

  it('swaps the route without animation when reduced motion is active', async () => {
    await setReducedMotion('reduce');
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);

    const { startViewTransition } = spyOnViewTransitions();

    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    expect(startViewTransition).toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(hasAnimatedViewTransition()).toBe(false);
  });

  it('preserves the notification scroll offset across a settings round trip', async () => {
    renderAtRoot(notificationFixture(20));

    await waitFor(() => expect(document.getElementById('notification-0')).not.toBeNull());
    await act(async () => {
      scrollContainer().scrollTop = 5 * 58;
    });
    await waitFor(() => expect(document.getElementById('notification-5')).not.toBeNull());
    const scrollTopBefore = scrollContainer().scrollTop;
    expect(scrollTopBefore).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    await waitFor(() => expect(document.getElementById('notification-5')).not.toBeNull());
    expect(scrollContainer().scrollTop).toBeCloseTo(scrollTopBefore, 0);
  });

  it('preserves a collapsed repository across a settings round trip', async () => {
    renderAtRoot(notificationFixture(4));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Hide repository notifications' })).toBeVisible(),
    );
    await userEvent.click(screen.getByTestId('repository-toggle'));
    expect(
      await screen.findByRole('button', { name: 'Show repository notifications' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(
      await screen.findByRole('button', { name: 'Show repository notifications' }),
    ).toBeInTheDocument();
  });

  it('applies a runtime reduced-motion change to the next route change', async () => {
    await setReducedMotion('no-preference');

    const { startViewTransition, records } = spyOnViewTransitions();

    renderAtRoot();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByTestId('settings')).toBeInTheDocument();
    await waitFor(() => {
      expect(records).toHaveLength(1);
    });
    expect(records[0].pseudoElements.size).toBeGreaterThan(0);
    await Promise.all(viewTransitionAnimations().map((animation) => animation.finished));

    await setReducedMotion('reduce');

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('No new notifications')).toBeInTheDocument();
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(hasAnimatedViewTransition()).toBe(false);
  });
});
