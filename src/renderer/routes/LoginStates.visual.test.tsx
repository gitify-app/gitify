import { waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { setLoginsOverrides } from '../__helpers__/hook-mocks';
import { renderRoute } from '../__helpers__/visual-utils';
import { mockGitHubCliAccount } from '../__mocks__/account-mocks';

import { DesignLanguage, Theme } from '../types';

import { GitHubLoginWithDeviceFlowRoute } from './github/LoginWithDeviceFlow';
import { GitHubLoginWithCLIRoute } from './github/LoginWithGitHubCLI';
import { GitHubLoginWithPersonalAccessTokenRoute } from './github/LoginWithPersonalAccessToken';

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, theme: Theme.DARK },
] as const;

async function waitForLoginError() {
  await waitFor(() =>
    expect(document.querySelector('[data-testid="login-errors"]')).not.toBeNull(),
  );
}

/** Moves the pointer off controls so tooltips do not leak into the baseline. */
async function movePointerAway() {
  await page.getByTestId('visual-root').hover({ position: { x: 480, y: 380 } });
}

async function capturePatError(theme: Theme, designLanguage: DesignLanguage) {
  setLoginsOverrides({
    loginWithPersonalAccessToken: vi.fn().mockRejectedValue(new Error('Bad credentials')),
  });

  renderRoute(<GitHubLoginWithPersonalAccessTokenRoute />, {
    theme,
    designLanguage,
    initialEntries: ['/login/github/personal-access-token'],
  });

  await waitFor(() => expect(document.querySelector('[data-testid="login-token"]')).not.toBeNull());
  await page.getByTestId('login-token').fill(`ghp_${'a'.repeat(36)}`);
  await page.getByTestId('login-submit').click();
  await waitForLoginError();
  await movePointerAway();

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `login-pat-error-${theme.toLowerCase()}-${designLanguage}`,
  );
}

async function captureDeviceFlowError(theme: Theme, designLanguage: DesignLanguage) {
  setLoginsOverrides({
    loginWithDeviceFlowStart: vi.fn().mockRejectedValue(new Error('Device flow unavailable')),
  });

  renderRoute(<GitHubLoginWithDeviceFlowRoute />, {
    theme,
    designLanguage,
    initialEntries: ['/login/github/device-flow'],
  });

  await waitFor(() =>
    expect(document.querySelector('[data-testid="device-scope-full"]')).not.toBeNull(),
  );
  await page.getByTestId('device-scope-full').click();
  await waitForLoginError();
  await movePointerAway();

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `login-device-flow-error-${theme.toLowerCase()}-${designLanguage}`,
  );
}

async function captureCliError(theme: Theme, designLanguage: DesignLanguage) {
  setLoginsOverrides({
    loginWithCli: vi.fn().mockRejectedValue(new Error('GitHub CLI is not installed')),
  });

  renderRoute(<GitHubLoginWithCLIRoute />, {
    theme,
    designLanguage,
    initialEntries: ['/login/github/cli'],
  });

  await waitFor(() => expect(document.querySelector('[data-testid="login-submit"]')).toBeEnabled());
  await page.getByTestId('login-submit').click();
  await waitForLoginError();
  await movePointerAway();

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `login-cli-error-${theme.toLowerCase()}-${designLanguage}`,
  );
}

async function captureCliAccounts(theme: Theme, designLanguage: DesignLanguage) {
  vi.mocked(window.gitify.githubCliAccounts).mockResolvedValue({
    accounts: [
      { identity: { kind: 'account', login: 'octocat' }, active: true },
      { identity: { kind: 'account', login: 'octocat-work' }, active: false },
    ],
  });

  renderRoute(<GitHubLoginWithCLIRoute />, {
    accounts: [{ ...mockGitHubCliAccount, cliIdentity: { kind: 'account', login: 'octocat' } }],
    theme,
    designLanguage,
    initialEntries: ['/login/github/cli'],
  });

  await waitFor(() => {
    const picker = page.getByTestId('login-cli-account').element();
    const contents = picker.closest('.gitify-scroll-fade')!;
    expect(contents.scrollHeight).toBeLessThanOrEqual(contents.clientHeight);
  });
  await movePointerAway();

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `login-cli-accounts-${theme.toLowerCase()}-${designLanguage}`,
  );
}

async function captureCliNoAccounts(theme: Theme, designLanguage: DesignLanguage) {
  vi.mocked(window.gitify.githubCliAccounts).mockResolvedValue({ accounts: [] });

  renderRoute(<GitHubLoginWithCLIRoute />, {
    theme,
    designLanguage,
    initialEntries: ['/login/github/cli'],
  });

  await waitFor(() =>
    expect(document.querySelector('[data-testid="login-cli-no-accounts"]')).not.toBeNull(),
  );
  await movePointerAway();

  await expect(page.getByTestId('visual-root')).toMatchScreenshot(
    `login-cli-no-accounts-${theme.toLowerCase()}-${designLanguage}`,
  );
}

describe('renderer/routes/Login error states visual regression', () => {
  describe.each(THEME_VARIANTS)('$theme $designLanguage', ({ designLanguage, theme }) => {
    it('captures the PAT credentials error', async () => {
      await capturePatError(theme, designLanguage);

      expect(document.querySelector('[data-testid="login-errors"]')).not.toBeNull();
    });

    it('captures the device-flow start error', async () => {
      await captureDeviceFlowError(theme, designLanguage);

      expect(document.querySelector('[data-testid="login-errors"]')).not.toBeNull();
    });

    it('captures the GitHub CLI error', async () => {
      await captureCliError(theme, designLanguage);

      expect(document.querySelector('[data-testid="login-errors"]')).not.toBeNull();
    });

    it('captures the CLI account picker', async () => {
      await captureCliAccounts(theme, designLanguage);

      expect(document.querySelector('[data-testid="login-cli-account"]')).not.toBeNull();
    });

    it('captures the CLI empty-account state', async () => {
      await captureCliNoAccounts(theme, designLanguage);

      expect(document.querySelector('[data-testid="login-cli-no-accounts"]')).not.toBeNull();
    });
  });
});
