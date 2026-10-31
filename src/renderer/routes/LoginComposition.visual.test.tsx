import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../__helpers__/visual-utils';

import { DesignLanguage, Theme } from '../types';

import { LoginRoute } from './Login';

const THEME_VARIANTS = [
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.CLASSIC, label: 'classic dark', theme: Theme.DARK },
  { designLanguage: DesignLanguage.GLASS, label: 'glass light', theme: Theme.LIGHT },
  { designLanguage: DesignLanguage.GLASS, label: 'glass dark', theme: Theme.DARK },
] as const;

function renderLogin(theme: Theme, designLanguage: DesignLanguage) {
  renderRoute(<LoginRoute />, {
    theme,
    designLanguage,
    initialEntries: ['/login'],
  });
}

function topOf(locator: ReturnType<typeof page.getByTestId>): number {
  return locator.element().getBoundingClientRect().y;
}

describe('renderer/routes/Login composition visual regression', () => {
  describe.each(THEME_VARIANTS)('$label', ({ designLanguage, theme }) => {
    it('captures a single-method forge', async () => {
      renderLogin(theme, designLanguage);
      await page.getByRole('tab', { name: 'Gitea' }).click();

      await expect(page.getByTestId('visual-root')).toMatchScreenshot(
        `login-gitea-selected-${theme.toLowerCase()}-${designLanguage}`,
      );
    });
  });

  it('keeps the heading and forge selector fixed across forges', async () => {
    renderLogin(Theme.LIGHT, DesignLanguage.CLASSIC);

    const heading = page.getByRole('heading', { name: 'Git Notifications' });
    const tablist = page.getByRole('tablist', { name: 'Choose a forge' });
    const logo = page.getByTestId('login-logo');

    const initialHeading = topOf(heading);
    const initialTablist = topOf(tablist);
    const initialLogo = topOf(logo);

    await page.getByRole('tab', { name: 'Gitea' }).click();
    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
    await expect.element(page.getByRole('button', { name: 'Continue with Gitea' })).toBeVisible();

    expect(topOf(heading)).toBeCloseTo(initialHeading, 1);
    expect(topOf(tablist)).toBeCloseTo(initialTablist, 1);
    expect(topOf(logo)).toBeCloseTo(initialLogo, 1);

    await page.getByRole('tab', { name: 'GitHub' }).click();
    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
    await expect.element(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();

    expect(topOf(heading)).toBeCloseTo(initialHeading, 1);
    expect(topOf(tablist)).toBeCloseTo(initialTablist, 1);
    expect(topOf(logo)).toBeCloseTo(initialLogo, 1);
  });

  it('keeps the GitHub secondary buttons within two rows and inside the window', async () => {
    renderLogin(Theme.LIGHT, DesignLanguage.CLASSIC);

    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
    await expect.element(page.getByText('or')).toBeVisible();

    const buttons = [
      page.getByRole('button', { name: 'Personal Access Token' }),
      page.getByRole('button', { name: 'GitHub CLI' }),
      page.getByRole('button', { name: 'Custom OAuth App' }),
    ];

    for (const button of buttons) {
      // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
      await expect.element(button).toBeVisible();
    }

    const panelRect = page.getByRole('tabpanel').element().getBoundingClientRect();
    const buttonRects = buttons.map((button) => button.element().getBoundingClientRect());

    // Natural-width buttons: they wrap to at most two rows and never fill the panel.
    expect(new Set(buttonRects.map((rect) => Math.round(rect.y))).size).toBeLessThanOrEqual(2);
    for (const rect of buttonRects) {
      expect(rect.width).toBeLessThan(panelRect.width);
    }

    const tagline = page.getByText('GitHub Cloud & GitHub Enterprise Server');
    // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
    await expect.element(tagline).toBeVisible();

    const taglineRect = tagline.element().getBoundingClientRect();
    expect(taglineRect.y + taglineRect.height).toBeLessThanOrEqual(400);
  });

  it('fits the login screen at the maximum supported zoom', async () => {
    // 120% of the 500x400 window: the CSS viewport the renderer sees.
    await page.viewport(465, 372);

    try {
      renderLogin(Theme.LIGHT, DesignLanguage.CLASSIC);

      const tablistRect = page
        .getByRole('tablist', { name: 'Choose a forge' })
        .element()
        .getBoundingClientRect();
      const panelRect = page.getByRole('tabpanel').element().getBoundingClientRect();

      expect(tablistRect.x).toBeGreaterThanOrEqual(0);
      expect(tablistRect.x + tablistRect.width).toBeLessThanOrEqual(465);
      expect(panelRect.x).toBeGreaterThanOrEqual(0);
      expect(panelRect.x + panelRect.width).toBeLessThanOrEqual(465);

      const buttons = [
        page.getByRole('button', { name: 'Personal Access Token' }),
        page.getByRole('button', { name: 'GitHub CLI' }),
        page.getByRole('button', { name: 'Custom OAuth App' }),
      ];

      for (const button of buttons) {
        // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
        await expect.element(button).toBeVisible();
      }

      const buttonRects = buttons.map((button) => button.element().getBoundingClientRect());
      expect(new Set(buttonRects.map((rect) => Math.round(rect.y))).size).toBeLessThanOrEqual(2);

      const tagline = page.getByText('GitHub Cloud & GitHub Enterprise Server');
      // oxlint-disable-next-line typescript/await-thenable -- Vitest types omit `expect.element`'s poll promise
      await expect.element(tagline).toBeVisible();

      const taglineRect = tagline.element().getBoundingClientRect();
      expect(taglineRect.y + taglineRect.height).toBeLessThanOrEqual(372);
    } finally {
      await page.viewport(500, 400);
    }
  });
});
