import { act, cleanup, render, screen } from '@testing-library/react';

import { BaseStyles } from '@primer/react';
import { ThemeProvider, useTheme } from '@primer/react/next';

import { Constants } from '../constants';

import { useSettingsStore } from '../stores';

import { DesignLanguage, type SettingsState, Theme } from '../types';

import { useAppearance } from './useAppearance';

vi.unmock('@primer/react/next');

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const CONTRAST_QUERY = '(prefers-contrast: more)';
const TRANSPARENCY_QUERY = '(prefers-reduced-transparency: reduce)';

function createMediaQuery(media: string) {
  const target = Object.assign(new EventTarget(), { media, matches: false, onchange: null });

  return {
    query: target as unknown as MediaQueryList,
    setMatches(matches: boolean) {
      target.matches = matches;
      target.dispatchEvent(new Event('change'));
    },
  };
}

function AppearanceProbe() {
  useAppearance();
  const { colorMode, resolvedColorMode, colorScheme } = useTheme();

  return (
    <div
      data-mode={colorMode}
      data-resolved-mode={resolvedColorMode}
      data-scheme={colorScheme}
      data-testid="appearance"
    />
  );
}

function renderAppearance(settings: Partial<SettingsState> = {}) {
  useSettingsStore.setState(settings);

  return render(
    <ThemeProvider>
      <BaseStyles>
        <AppearanceProbe />
      </BaseStyles>
    </ThemeProvider>,
  );
}

function getThemeWrapper() {
  const wrapper = screen.getByTestId('appearance').closest('[data-color-mode]');
  expect(wrapper).toBeInTheDocument();
  return wrapper!;
}

describe('renderer/hooks/useAppearance real Primer provider integration', () => {
  let mediaQueries: Map<string, ReturnType<typeof createMediaQuery>>;
  let rootAttributes: Record<string, string | null>;

  function mediaQuery(query: string) {
    let media = mediaQueries.get(query);
    if (!media) {
      media = createMediaQuery(query);
      mediaQueries.set(query, media);
    }
    return media;
  }

  beforeEach(() => {
    mediaQueries = new Map();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => mediaQuery(query).query);
    rootAttributes = Object.fromEntries(
      ['data-theme', 'data-glass-material', 'class'].map((name) => [
        name,
        document.documentElement.getAttribute(name),
      ]),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    for (const [name, value] of Object.entries(rootAttributes)) {
      if (value === null) {
        document.documentElement.removeAttribute(name);
      } else {
        document.documentElement.setAttribute(name, value);
      }
    }
  });

  it('keeps the theme attributes on a descendant wrapper around BaseStyles and content', () => {
    renderAppearance({ theme: Theme.LIGHT });

    const wrapper = getThemeWrapper();
    expect(wrapper).not.toBe(document.documentElement);
    expect(wrapper).toHaveAttribute('data-component', 'ThemeProvider');
    expect(wrapper).toHaveAttribute('data-color-mode', 'light');
    expect(wrapper).toHaveAttribute('data-light-theme', 'light');
    expect(wrapper).toHaveAttribute('data-dark-theme', 'light');
    expect(wrapper.querySelector('[data-component="BaseStyles"]')).toContainElement(
      screen.getByTestId('appearance'),
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'classic');
  });

  it.each([
    { theme: Theme.LIGHT, mode: 'day', scheme: 'light' },
    { theme: Theme.LIGHT_COLORBLIND, mode: 'day', scheme: 'light_colorblind' },
    { theme: Theme.LIGHT_TRITANOPIA, mode: 'day', scheme: 'light_tritanopia' },
    { theme: Theme.DARK, mode: 'night', scheme: 'dark' },
    { theme: Theme.DARK_COLORBLIND, mode: 'night', scheme: 'dark_colorblind' },
    { theme: Theme.DARK_TRITANOPIA, mode: 'night', scheme: 'dark_tritanopia' },
    { theme: Theme.DARK_DIMMED, mode: 'night', scheme: 'dark_dimmed' },
  ])('preserves the Classic $theme mapping', ({ theme, mode, scheme }) => {
    renderAppearance({ designLanguage: DesignLanguage.CLASSIC, theme });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-mode', mode);
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-resolved-mode', mode);
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', scheme);
    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', mode === 'day' ? 'light' : 'dark');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', scheme);
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', scheme);
  });

  it('updates fixed color modes and native sources when settings change', async () => {
    renderAppearance({ theme: Theme.LIGHT });

    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'light');
    expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('light');

    await act(async () => {
      useSettingsStore.setState({ theme: Theme.DARK });
    });

    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'dark');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'dark');
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-mode', 'night');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'dark');
    expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('dark');

    await act(async () => {
      useSettingsStore.setState({ theme: Theme.SYSTEM });
    });

    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'auto');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light');
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-mode', 'auto');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-resolved-mode', 'day');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'light');
    expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('system');
  });

  it('responds to OS color-scheme changes without replacing System with a fixed mode', async () => {
    renderAppearance({ theme: Theme.SYSTEM });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-resolved-mode', 'day');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'light');

    await act(async () => {
      mediaQuery(COLOR_SCHEME_QUERY).setMatches(true);
    });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-mode', 'auto');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-resolved-mode', 'night');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'dark');
    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'auto');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light');
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark');
    expect(useSettingsStore.getState().theme).toBe(Theme.SYSTEM);
    expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith('system');
    expect(window.gitify.setNativeTheme).not.toHaveBeenCalledWith('dark');
  });

  it.each([
    { theme: Theme.LIGHT, scheme: 'light' },
    { theme: Theme.DARK, scheme: 'dark' },
  ])('updates Classic $theme for the in-app contrast setting', async ({ theme, scheme }) => {
    renderAppearance({ designLanguage: DesignLanguage.CLASSIC, theme });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', scheme);

    await act(async () => {
      useSettingsStore.setState({ increaseContrast: true });
    });

    expect(screen.getByTestId('appearance')).toHaveAttribute(
      'data-scheme',
      `${scheme}_high_contrast`,
    );
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', `${scheme}_high_contrast`);
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', `${scheme}_high_contrast`);

    await act(async () => {
      useSettingsStore.setState({ increaseContrast: false });
    });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', scheme);
  });

  it('updates and restores the Classic System scheme pair for live OS contrast changes', async () => {
    renderAppearance({ designLanguage: DesignLanguage.CLASSIC, theme: Theme.SYSTEM });

    await act(async () => {
      mediaQuery(CONTRAST_QUERY).setMatches(true);
    });

    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'auto');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light_high_contrast');
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark_high_contrast');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'light_high_contrast');

    await act(async () => {
      mediaQuery(COLOR_SCHEME_QUERY).setMatches(true);
    });

    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'dark_high_contrast');

    await act(async () => {
      mediaQuery(CONTRAST_QUERY).setMatches(false);
    });

    expect(getThemeWrapper()).toHaveAttribute('data-color-mode', 'auto');
    expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light');
    expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'dark');
    expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'dark');
    expect(useSettingsStore.getState().theme).toBe(Theme.SYSTEM);
  });

  describe('Glass', () => {
    it.each([
      { theme: Theme.LIGHT, mode: 'day', scheme: 'light', wrapperMode: 'light' },
      { theme: Theme.DARK, mode: 'night', scheme: 'dark', wrapperMode: 'dark' },
      { theme: Theme.SYSTEM, mode: 'auto', scheme: 'light', wrapperMode: 'auto' },
    ])(
      'preserves $theme without Classic high-contrast schemes',
      async ({ theme, mode, scheme, wrapperMode }) => {
        await act(async () => {
          renderAppearance({ designLanguage: DesignLanguage.GLASS, theme, increaseContrast: true });
        });

        expect(screen.getByTestId('appearance')).toHaveAttribute('data-mode', mode);
        expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', scheme);
        expect(getThemeWrapper()).toHaveAttribute('data-color-mode', wrapperMode);
        expect(getThemeWrapper()).toHaveAttribute(
          'data-light-theme',
          theme === Theme.SYSTEM ? 'light' : scheme,
        );
        expect(getThemeWrapper()).toHaveAttribute(
          'data-dark-theme',
          theme === Theme.SYSTEM ? 'dark' : scheme,
        );
      },
    );

    it.each([
      { theme: Theme.LIGHT_COLORBLIND, classicScheme: 'light_colorblind', glassScheme: 'light' },
      { theme: Theme.LIGHT_TRITANOPIA, classicScheme: 'light_tritanopia', glassScheme: 'light' },
      { theme: Theme.DARK_COLORBLIND, classicScheme: 'dark_colorblind', glassScheme: 'dark' },
      { theme: Theme.DARK_TRITANOPIA, classicScheme: 'dark_tritanopia', glassScheme: 'dark' },
      { theme: Theme.DARK_DIMMED, classicScheme: 'dark_dimmed', glassScheme: 'dark' },
    ])(
      'clamps and restores stored $theme without rewriting it',
      async ({ theme, classicScheme, glassScheme }) => {
        renderAppearance({ designLanguage: DesignLanguage.CLASSIC, theme });

        expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', classicScheme);

        await act(async () => {
          useSettingsStore.setState({ designLanguage: DesignLanguage.GLASS });
        });

        expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', glassScheme);
        expect(getThemeWrapper()).toHaveAttribute('data-color-mode', glassScheme);
        expect(useSettingsStore.getState().theme).toBe(theme);
        expect(JSON.parse(localStorage.getItem(Constants.STORAGE.SETTINGS)!).state.theme).toBe(
          theme,
        );
        expect(window.gitify.setNativeTheme).toHaveBeenLastCalledWith(glassScheme);

        await act(async () => {
          useSettingsStore.setState({ designLanguage: DesignLanguage.CLASSIC });
        });

        expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', classicScheme);
        expect(useSettingsStore.getState().theme).toBe(theme);
        expect(JSON.parse(localStorage.getItem(Constants.STORAGE.SETTINGS)!).state.theme).toBe(
          theme,
        );
      },
    );

    it.each([
      { platform: 'macOS', macOS: true, linux: false, material: 'vibrancy' },
      { platform: 'Linux', macOS: false, linux: true, material: 'backdrop-filter' },
      { platform: 'Windows', macOS: false, linux: false, material: 'backdrop-filter' },
    ])(
      'preserves root attributes and material on $platform',
      async ({ macOS, linux, material }) => {
        vi.mocked(window.gitify.platform.isMacOS).mockReturnValue(macOS);
        vi.mocked(window.gitify.platform.isLinux).mockReturnValue(linux);

        await act(async () => {
          renderAppearance({ designLanguage: DesignLanguage.GLASS });
        });

        expect(document.documentElement).toHaveAttribute('data-theme', 'glass');
        expect(document.documentElement).toHaveAttribute('data-glass-material', material);
        expect(document.documentElement.classList.contains('gitify-linux')).toBe(linux);
        expect(document.documentElement).toHaveClass('gitify-translucent');
        if (macOS) {
          expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(true);
        } else {
          expect(window.gitify.setWindowVibrancy).not.toHaveBeenCalled();
        }
      },
    );

    it('updates status-color opt-in without applying it to Classic', async () => {
      await act(async () => {
        renderAppearance({ designLanguage: DesignLanguage.GLASS });
      });
      expect(document.documentElement).not.toHaveClass('gitify-colored-icons');

      await act(async () => {
        useSettingsStore.setState({ showStatusIconColors: true });
      });
      expect(document.documentElement).toHaveClass('gitify-colored-icons');

      await act(async () => {
        useSettingsStore.setState({ showStatusIconColors: false });
      });
      expect(document.documentElement).not.toHaveClass('gitify-colored-icons');

      await act(async () => {
        useSettingsStore.setState({
          designLanguage: DesignLanguage.CLASSIC,
          showStatusIconColors: true,
        });
      });
      expect(document.documentElement).toHaveAttribute('data-theme', 'classic');
      expect(document.documentElement).not.toHaveClass('gitify-colored-icons');
    });

    it.each([
      { preference: 'reduced transparency', query: TRANSPARENCY_QUERY },
      { preference: 'increased contrast', query: CONTRAST_QUERY },
    ])('degrades and restores transparency for live OS $preference', async ({ query }) => {
      await act(async () => {
        renderAppearance({ designLanguage: DesignLanguage.GLASS, theme: Theme.LIGHT });
      });

      expect(document.documentElement).toHaveClass('gitify-translucent', 'gitify-vibrant');

      await act(async () => {
        mediaQuery(query).setMatches(true);
      });

      expect(document.documentElement).not.toHaveClass('gitify-translucent');
      expect(document.documentElement).not.toHaveClass('gitify-vibrant');
      expect(window.gitify.setWindowVibrancy).toHaveBeenLastCalledWith(false);
      expect(screen.getByTestId('appearance')).toHaveAttribute('data-scheme', 'light');
      expect(getThemeWrapper()).toHaveAttribute('data-light-theme', 'light');
      expect(getThemeWrapper()).toHaveAttribute('data-dark-theme', 'light');

      await act(async () => {
        mediaQuery(query).setMatches(false);
      });

      expect(document.documentElement).toHaveClass('gitify-translucent', 'gitify-vibrant');
      expect(window.gitify.setWindowVibrancy).toHaveBeenLastCalledWith(true);
    });

    it('adds the vibrant class after native success and removes it before disabling vibrancy', async () => {
      const application = Promise.withResolvers<undefined>();
      vi.mocked(window.gitify.setWindowVibrancy).mockImplementation((enabled) => {
        expect(document.documentElement).not.toHaveClass('gitify-vibrant');
        return enabled ? application.promise : Promise.resolve(undefined);
      });

      renderAppearance({ designLanguage: DesignLanguage.GLASS });

      expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(true);
      expect(document.documentElement).not.toHaveClass('gitify-vibrant');

      await act(async () => {
        application.resolve(undefined);
        await application.promise;
      });

      expect(document.documentElement).toHaveClass('gitify-vibrant');

      await act(async () => {
        useSettingsStore.setState({ designLanguage: DesignLanguage.CLASSIC });
      });

      expect(window.gitify.setWindowVibrancy).toHaveBeenLastCalledWith(false);
      expect(document.documentElement).not.toHaveClass('gitify-vibrant');
    });

    it('leaves the vibrant class absent when native application rejects', async () => {
      const application = Promise.withResolvers<undefined>();
      vi.mocked(window.gitify.setWindowVibrancy).mockReturnValueOnce(application.promise);

      renderAppearance({ designLanguage: DesignLanguage.GLASS });

      expect(document.documentElement).not.toHaveClass('gitify-vibrant');

      await act(async () => {
        application.reject(new Error('Native material unavailable'));
      });

      expect(window.gitify.setWindowVibrancy).toHaveBeenCalledWith(true);
      expect(document.documentElement).not.toHaveClass('gitify-vibrant');
    });
  });
});
