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

interface TransitionRecord {
  pseudoElements: Set<string>;
  rootAnimated: boolean;
}

function getPseudoElement(animation: Animation): string | undefined {
  return (animation.effect as KeyframeEffect | null)?.pseudoElement ?? undefined;
}

function isAnimated(animation: Animation): boolean {
  const duration = animation.effect?.getComputedTiming().duration;
  return typeof duration === 'number' && duration > 0;
}

function spyOnViewTransitions() {
  const original = document.startViewTransition.bind(document);
  const startViewTransition = vi.spyOn(document, 'startViewTransition');
  const records: TransitionRecord[] = [];

  startViewTransition.mockImplementation((update) => {
    const transition = original(update);
    void transition.ready
      .then(() => {
        const animations = document.getAnimations();
        const pseudoElements = new Set(
          animations
            .map(getPseudoElement)
            .filter(
              (pseudoElement): pseudoElement is string =>
                pseudoElement?.startsWith('::view-transition') ?? false,
            ),
        );
        records.push({
          pseudoElements,
          rootAnimated: animations.some(
            (animation) =>
              getPseudoElement(animation)?.includes('(root)') &&
              getPseudoElement(animation)?.startsWith('::view-transition') &&
              isAnimated(animation),
          ),
        });
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

function renderAtRoot() {
  useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
  useSettingsStore.setState(mockSettings);
  window.history.replaceState(null, '', '#/');

  return render(<App />);
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
    expect(records.every((record) => !record.rootAnimated)).toBe(true);
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
