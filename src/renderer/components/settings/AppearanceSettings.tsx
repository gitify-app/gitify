import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { PaintbrushIcon, SyncIcon, ZoomInIcon, ZoomOutIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Select, Stack, Text } from '@primer/react';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { Title } from '../primitives/Title';

import { DesignLanguage, Theme } from '../../types';

import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  loadLanguageLocale,
  type Language,
} from '../../i18n';
import { resolveColorMode, supportedColorModes } from '../../utils/ui/theme';
import {
  canDecreaseZoom,
  canIncreaseZoom,
  decreaseZoom,
  increaseZoom,
  resetZoomLevel,
} from '../../utils/ui/zoom';

export const AppearanceSettings: FC = () => {
  const { t } = useTranslation();

  // Account store values
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const designLanguage = useSettingsStore((s) => s.designLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);
  const showStatusIconColors = useSettingsStore((s) => s.showStatusIconColors);

  const colorModeSupported = (mode: Theme) => supportedColorModes(designLanguage).includes(mode);
  const showAccountHeader = useSettingsStore((s) => s.showAccountHeader);
  const wrapNotificationTitle = useSettingsStore((s) => s.wrapNotificationTitle);
  const zoomPercentage = useSettingsStore((s) => s.zoomPercentage);

  // Language (stored independently of the settings store, see i18n/loader)
  const locale = loadLanguageLocale();
  const language = SUPPORTED_LANGUAGES.includes(locale as Language)
    ? (locale as Language)
    : DEFAULT_LANGUAGE;

  return (
    <fieldset>
      <Title icon={PaintbrushIcon}>{t('settings.appearance.title', 'Appearance')}</Title>

      <Stack direction="vertical" gap="condensed">
        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel label={t('settings.appearance.language', 'Language:')} name="language" />
          <Select
            data-testid="settings-language"
            onChange={(evt) => {
              i18n.changeLanguage(evt.target.value as Language);
            }}
            value={language}
          >
            {LANGUAGES.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Stack>

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel label={t('settings.appearance.design', 'Design:')} name="design-language" />
          <Select
            data-testid="settings-design-language"
            onChange={(evt) => updateSetting('designLanguage', evt.target.value as DesignLanguage)}
            value={designLanguage}
          >
            <Select.Option value={DesignLanguage.CLASSIC}>
              {t('settings.appearance.design_language_classic', 'Classic')}
            </Select.Option>
            <Select.Option value={DesignLanguage.GLASS}>
              {t('settings.appearance.design_language_glass', 'Glass')}
            </Select.Option>
          </Select>
        </Stack>

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel label={t('settings.appearance.theme', 'Theme:')} name="theme" />
          <Select
            data-testid="settings-theme"
            onChange={(evt) => updateSetting('theme', evt.target.value as Theme)}
            value={resolveColorMode(designLanguage, theme)}
          >
            <Select.OptGroup label={t('settings.appearance.theme_group_system', 'System')}>
              <Select.Option value={Theme.SYSTEM}>
                {t('settings.appearance.theme_system', 'System')}
              </Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label={t('settings.appearance.theme_group_light', 'Light')}>
              <Select.Option value={Theme.LIGHT}>
                {t('settings.appearance.theme_light_default', 'Light default')}
              </Select.Option>
              {colorModeSupported(Theme.LIGHT_COLORBLIND) && (
                <Select.Option value={Theme.LIGHT_COLORBLIND}>
                  {t('settings.appearance.theme_light_colorblind', 'Light colorblind')}
                </Select.Option>
              )}
              {colorModeSupported(Theme.LIGHT_TRITANOPIA) && (
                <Select.Option value={Theme.LIGHT_TRITANOPIA}>
                  {t('settings.appearance.theme_light_tritanopia', 'Light Tritanopia')}
                </Select.Option>
              )}
            </Select.OptGroup>
            <Select.OptGroup label={t('settings.appearance.theme_group_dark', 'Dark')}>
              <Select.Option value={Theme.DARK}>
                {t('settings.appearance.theme_dark_default', 'Dark default')}
              </Select.Option>
              {colorModeSupported(Theme.DARK_COLORBLIND) && (
                <Select.Option value={Theme.DARK_COLORBLIND}>
                  {t('settings.appearance.theme_dark_colorblind', 'Dark colorblind')}
                </Select.Option>
              )}
              {colorModeSupported(Theme.DARK_TRITANOPIA) && (
                <Select.Option value={Theme.DARK_TRITANOPIA}>
                  {t('settings.appearance.theme_dark_tritanopia', 'Dark Tritanopia')}
                </Select.Option>
              )}
              {colorModeSupported(Theme.DARK_DIMMED) && (
                <Select.Option value={Theme.DARK_DIMMED}>
                  {t('settings.appearance.theme_dark_dimmed', 'Soft dark')}
                </Select.Option>
              )}
            </Select.OptGroup>
          </Select>
        </Stack>

        <Checkbox
          checked={increaseContrast}
          label={t('settings.appearance.increase_contrast', 'Increase contrast')}
          name="increaseContrast"
          onChange={() => toggleSetting('increaseContrast')}
          tooltip={
            <Text>
              {t(
                'settings.appearance.increase_contrast_help',
                "Use GitHub's high-contrast color schemes for improved legibility. Also applied automatically when your system's increase-contrast setting is enabled.",
              )}
            </Text>
          }
          visible={designLanguage === DesignLanguage.CLASSIC}
        />

        <Checkbox
          checked={showStatusIconColors}
          label={t('settings.appearance.show_status_icon_colors', 'Show status icon colors')}
          name="showStatusIconColors"
          onChange={() => toggleSetting('showStatusIconColors')}
          tooltip={
            <Text>
              {t(
                'settings.appearance.show_status_icon_colors_help',
                'Color the notification type icons by their state (open, closed, done, attention). Glass renders them monochrome by default.',
              )}
            </Text>
          }
          visible={designLanguage === DesignLanguage.GLASS}
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel label={t('settings.appearance.zoom', 'Zoom:')} name="zoom" />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label={t('settings.appearance.zoom_out', 'Zoom out')}
              data-testid="settings-zoom-out"
              disabled={!canDecreaseZoom(zoomPercentage)}
              icon={ZoomOutIcon}
              onClick={() => decreaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button
              aria-label={t('settings.appearance.zoom_percentage', 'Zoom percentage')}
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {zoomPercentage.toFixed(0)}%
            </Button>

            <IconButton
              aria-label={t('settings.appearance.zoom_in', 'Zoom in')}
              data-testid="settings-zoom-in"
              disabled={!canIncreaseZoom(zoomPercentage)}
              icon={ZoomInIcon}
              onClick={() => increaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label={t('settings.appearance.zoom_reset', 'Reset zoom')}
              data-testid="settings-zoom-reset"
              icon={SyncIcon}
              onClick={() => resetZoomLevel()}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={showAccountHeader}
          label={t('settings.appearance.show_account_header', 'Show account header')}
          name="showAccountHeader"
          onChange={() => toggleSetting('showAccountHeader')}
          tooltip={
            <Text>
              {t(
                'settings.appearance.show_account_header_help',
                'When enabled, displays an account header (avatar, username and quick links) above the notifications list.',
              )}
            </Text>
          }
          visible={!hasMultipleAccounts()}
        />

        <Checkbox
          checked={wrapNotificationTitle}
          label={t('settings.appearance.wrap_notification_title', 'Show full notification title')}
          name="wrapNotificationTitle"
          onChange={() => toggleSetting('wrapNotificationTitle')}
          tooltip={
            <Text>
              {t(
                'settings.appearance.wrap_notification_title_help',
                'Wrap long notification titles onto multiple lines instead of truncating with an ellipsis. This shows the full title but may increase the height of the notification list.',
              )}
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
};
