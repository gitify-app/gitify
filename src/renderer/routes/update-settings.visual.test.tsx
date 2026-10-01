import { act } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { useSettingsStore } from '../stores';

import { DesignLanguage, Theme } from '../types';

import { SettingsRoute } from './Settings';

it('lets a managed installation override and restore the automatic update default', async () => {
  vi.mocked(window.gitify.getUpdateManager).mockResolvedValue('pacman');
  await act(async () => {
    await renderRoute(<SettingsRoute />, {
      theme: Theme.LIGHT,
      designLanguage: DesignLanguage.CLASSIC,
      initialEntries: ['/settings'],
      accounts: [mockGitHubCloudAccount],
    });
  });

  await expect
    .element(page.getByText('Automatic updates are off by default. Update Gitify using pacman.'))
    .toBeVisible();
  await act(async () => {
    await page.getByTestId('radio-automaticUpdates-enabled').click();
  });
  await expect.element(page.getByTestId('radio-automaticUpdates-enabled')).toBeChecked();
  expect(useSettingsStore.getState().automaticUpdates).toBe('enabled');
  await expect
    .element(
      page.getByText('Gitify downloads updates automatically and installs them when you quit.'),
    )
    .toBeVisible();

  await act(async () => {
    await page.getByTestId('radio-automaticUpdates-disabled').click();
  });
  await expect
    .element(page.getByText('Automatic updates are off. View releases from the tray menu.'))
    .toBeVisible();
  expect(useSettingsStore.getState().automaticUpdates).toBe('disabled');

  await act(async () => {
    await page.getByTestId('radio-automaticUpdates-default').click();
  });
  await expect
    .element(page.getByText('Automatic updates are off by default. Update Gitify using pacman.'))
    .toBeVisible();
  expect(useSettingsStore.getState().automaticUpdates).toBe('default');
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});

it('keeps direct installations on by default and permits disabling updates', async () => {
  await act(async () => {
    await renderRoute(<SettingsRoute />, {
      theme: Theme.DARK,
      designLanguage: DesignLanguage.GLASS,
      initialEntries: ['/settings'],
      accounts: [mockGitHubCloudAccount],
    });
  });
  await expect.element(page.getByText('Automatic updates are on by default.')).toBeVisible();
  await act(async () => {
    await page.getByTestId('radio-automaticUpdates-disabled').click();
  });
  await expect.element(page.getByTestId('radio-automaticUpdates-disabled')).toBeChecked();
  await expect
    .element(page.getByText('Automatic updates are off. View releases from the tray menu.'))
    .toBeVisible();
});
