import { page } from 'vite-plus/test/browser';

import { setLoginsOverrides } from '../../__helpers__/hook-mocks';
import { renderRoute } from '../../__helpers__/visual-utils';

import { useAccountsStore } from '../../stores';

import { DesignLanguage, Theme } from '../../types';

import { GiteaLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('Gitea HTTP login', () => {
  beforeEach(() => {
    setLoginsOverrides({
      loginWithPersonalAccessToken: ({ token, hostname }) =>
        useAccountsStore
          .getState()
          .createAccount('Personal Access Token', token, hostname, 'gitea'),
    });
  });
  it('logs in over HTTP and retains the account when persisted state is reloaded', async () => {
    const origin = 'http://git.internal:3000';
    vi.mocked(fetch).mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: 7, login: 'lan-user', full_name: 'LAN User' }), {
          headers: { 'content-type': 'application/json' },
        }),
    );
    await renderRoute(<GiteaLoginWithPersonalAccessTokenRoute />, {
      theme: Theme.LIGHT,
      designLanguage: DesignLanguage.CLASSIC,
    });

    await page.getByTestId('login-hostname').fill(origin);
    await page.getByTestId('login-create-token').click();
    expect(window.gitify.openExternalLink).toHaveBeenCalledWith(
      `${origin}/user/settings/applications`,
      true,
    );
    await page.getByTestId('login-token').fill('a'.repeat(40));
    await page.getByTestId('login-submit').click();

    await expect.poll(() => useAccountsStore.getState().accounts).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      `${origin}/api/v1/user`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'token decrypted' }),
      }),
    );
    await useAccountsStore.persist.rehydrate();
    expect(useAccountsStore.getState().accounts[0]).toMatchObject({
      forge: 'gitea',
      hostname: origin,
      user: { login: 'lan-user' },
    });
  });

  it('shows validation and API errors', async () => {
    await renderRoute(<GiteaLoginWithPersonalAccessTokenRoute />, {
      theme: Theme.LIGHT,
      designLanguage: DesignLanguage.CLASSIC,
    });
    await page.getByTestId('login-submit').click();
    await expect.element(page.getByText('Hostname is required')).toBeVisible();
    await page.getByTestId('login-hostname').fill('http://user:secret@git.internal/path');
    await expect.element(page.getByTestId('login-create-token')).toBeDisabled();
    await page.getByTestId('login-submit').click();
    await expect.element(page.getByText('Hostname format is invalid')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();

    vi.mocked(fetch).mockImplementation(
      async () => new Response(null, { status: 401, statusText: 'Unauthorized' }),
    );
    await page.getByTestId('login-hostname').fill('http://git.internal:3000');
    await page.getByTestId('login-token').fill('a'.repeat(40));
    await page.getByTestId('login-submit').click();
    await expect
      .element(page.getByTestId('login-errors'))
      .toMatchTextContent('Gitea API 401 Unauthorized');
    expect(useAccountsStore.getState().accounts).toHaveLength(0);
  });
});
