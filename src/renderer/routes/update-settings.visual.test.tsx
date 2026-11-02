import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { useSettingsStore } from '../stores';

import { DesignLanguage, Theme } from '../types';

import { SettingsRoute } from './Settings';

async function expectText(text: string) {
  // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
  await expect.element(page.getByText(text)).toBeVisible();
}

async function choose(value: 'default' | 'enabled' | 'disabled') {
  const choice = page.getByTestId(`choice-automaticUpdates-${value}`);
  await choice.click();
  // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
  await expect.element(choice).toHaveAttribute('aria-pressed', 'true');
  expect(useSettingsStore.getState().automaticUpdates).toBe(value);
}

it('lets a managed installation override and restore the automatic update default', async () => {
  vi.mocked(window.gitify.getUpdateManager).mockResolvedValue('Scoop');
  renderRoute(<SettingsRoute />, {
    theme: Theme.LIGHT,
    designLanguage: DesignLanguage.CLASSIC,
    initialEntries: ['/settings'],
    accounts: [mockGitHubCloudAccount],
  });

  await expectText('Off by default. Update Gitify with Scoop.');
  await choose('enabled');
  await expectText('Gitify downloads updates automatically and installs them when you quit.');
  await choose('disabled');
  await expectText('Automatic updates are off. View releases from the tray menu.');
  await choose('default');
  await expectText('Off by default. Update Gitify with Scoop.');
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});

it('keeps direct installations on by default and permits disabling updates', async () => {
  renderRoute(<SettingsRoute />, {
    theme: Theme.DARK,
    designLanguage: DesignLanguage.GLASS,
    initialEntries: ['/settings'],
    accounts: [mockGitHubCloudAccount],
  });

  // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
  await expect.element(page.getByText('On by default.')).toBeVisible();
  await choose('disabled');
  await expectText('Automatic updates are off. View releases from the tray menu.');
});
