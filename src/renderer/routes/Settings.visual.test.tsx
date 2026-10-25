import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute, scrollToTestId } from '../__helpers__/visual-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';

import { DesignLanguage, type SettingsState, Theme } from '../types';

import { SettingsRoute } from './Settings';

const accounts = [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount];

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

function renderSettings(
  theme: Theme,
  designLanguage: DesignLanguage,
  settings: Partial<SettingsState> = {},
) {
  return renderRoute(<SettingsRoute />, {
    theme,
    designLanguage,
    accounts,
    initialEntries: ['/settings'],
    settings,
  });
}

async function openDesignHelp(theme: Theme, designLanguage: DesignLanguage) {
  renderSettings(theme, designLanguage);

  const trigger = page.getByTestId('tooltip-icon-tooltip-designLanguage');
  await waitFor(() =>
    expect(
      document.querySelector('[data-testid="tooltip-icon-tooltip-designLanguage"]'),
    ).not.toBeNull(),
  );
  await trigger.click();

  const content = page.getByTestId('tooltip-content-tooltip-designLanguage');
  // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
  await expect.element(content).toBeVisible();

  const root = document.querySelector('[data-testid="visual-root"]');
  const popover = document.querySelector('[data-testid="tooltip-content-tooltip-designLanguage"]');
  if (!root || !popover) {
    throw new Error('Help popover is missing');
  }

  expect(root.contains(popover)).toBe(true);
}

describe('renderer/routes/Settings visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('captures an open help popover', async () => {
      await openDesignHelp(theme, designLanguage);

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `settings-help-popover-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures selected segmented and select values', async () => {
      renderSettings(theme, designLanguage);

      await waitFor(() =>
        expect(
          document.querySelector(`[data-testid="choice-designLanguage-${designLanguage}"]`),
        ).not.toBeNull(),
      );

      expect(
        document
          .querySelector(`[data-testid="choice-designLanguage-${designLanguage}"]`)
          ?.getAttribute('aria-pressed'),
      ).toBe('true');
      expect(
        (document.querySelector('[data-testid="select-theme"]') as HTMLSelectElement | null)?.value,
      ).toBe(theme);

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `settings-choice-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures the notification volume reveal open', async () => {
      renderSettings(theme, designLanguage, { playSound: true });

      await scrollToTestId('reveal-volume');

      expect(
        document.querySelector('[data-testid="reveal-volume"]')?.getAttribute('data-state'),
      ).toBe('open');
      // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
      await expect.element(page.getByTestId('settings-volume-group')).toBeVisible();

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `settings-volume-reveal-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures the global shortcut reveal open', async () => {
      renderSettings(theme, designLanguage, { keyboardShortcut: true });

      await scrollToTestId('reveal-shortcutRecorder');

      expect(
        document
          .querySelector('[data-testid="reveal-shortcutRecorder"]')
          ?.getAttribute('data-state'),
      ).toBe('open');
      // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
      await expect.element(page.getByTestId('settings-shortcut-group')).toBeVisible();

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `settings-shortcut-reveal-${theme.toLowerCase()}-${designLanguage}`,
      );
    });

    it('captures the reset settings confirmation', async () => {
      renderSettings(theme, designLanguage);

      await scrollToTestId('settings-reset');
      await page.getByTestId('settings-reset').click();

      await waitFor(() => {
        const dialog = document.querySelector('[role="alertdialog"]');
        expect(dialog?.textContent).toContain('Reset settings?');
      });

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `settings-reset-confirmation-${theme.toLowerCase()}-${designLanguage}`,
      );

      // `useConfirm` mounts a separate React root outside the visual tree, so
      // dismiss it explicitly; otherwise it leaks into the next test.
      await page.getByRole('button', { name: 'Cancel' }).click();
      await waitFor(() => expect(document.querySelector('[role="alertdialog"]')).toBeNull());
    });
  });
});
